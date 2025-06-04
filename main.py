from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import pandas as pd
from groq import Groq
import tempfile
import os
from datetime import datetime

app = Flask(__name__)
CORS(app, resources={r"/*": {"origins": "*"}})

# Initialize Groq client (replace with your API key)
client = Groq(api_key="")

@app.route('/analyze', methods=['POST'])
def analyze_csv():
    try:
        if 'csv_file' not in request.files:
            return jsonify({"error": "No file uploaded"}), 400
        
        file = request.files['csv_file']
        
        if file.filename == '':
            return jsonify({"error": "No selected file"}), 400
        if not file.filename.endswith('.csv'):
            return jsonify({"error": "File must be a CSV"}), 400

        # Process CSV
        df = pd.read_csv(file)
        
        # Validate columns
        required_cols = ["Batter", "DisDescending", "Ave", "Span"]
        if not all(col in df.columns for col in required_cols):
            return jsonify({"error": f"CSV must contain: {required_cols}"}), 400

        # Get top 5 batsmen
        top_5 = df.sort_values("DisDescending", ascending=False).head(5)
        
        # Generate stories
        stories = []
        for _, row in top_5.iterrows():
            prompt = f"""Write a detailed cricket analysis about Nathan Lyon vs {row['Batter']}.
            Focus on:
            1. Key matches where Lyon dominated
            2. Technical weaknesses exploited
            3. Career impact
            Statistics: {row['DisDescending']} dismissals, average {row['Ave']} between {row['Span']}.
            Write in ESPN-style sports journalism."""
            
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model="llama3-8b-8192",
                temperature=0.7
            )
            
            stories.append({
                "batsman": row["Batter"],
                "dismissals": row["DisDescending"],
                "average": row["Ave"],
                "story": response.choices[0].message.content
            })

        return jsonify({"stories": stories})

    except Exception as e:
        app.logger.error(f"Analysis error: {str(e)}")
        return jsonify({"error": "Analysis failed"}), 500

@app.route('/download', methods=['POST'])
def download_report():
    try:
        data = request.get_json()
        if not data or 'stories' not in data:
            return jsonify({"error": "No stories provided"}), 400
        
        # Create temp file
        with tempfile.NamedTemporaryFile(mode='w+', suffix='.txt', delete=False) as tmp:
            for story in data['stories']:
                tmp.write(f"==== {story['batsman']} ====\n")
                tmp.write(f"Dismissals: {story['dismissals']}\n")
                tmp.write(f"Average: {story['average']}\n\n")
                tmp.write(story['story'] + "\n\n")
                tmp.write("="*50 + "\n\n")
            tmp_path = tmp.name

        # Send file and schedule cleanup
        response = send_file(
            tmp_path,
            as_attachment=True,
            download_name=f"lyon_analysis_{datetime.now().strftime('%Y%m%d')}.txt"
        )
        
        # Cleanup after send
        response.call_on_close(lambda: os.unlink(tmp_path))
        return response

    except Exception as e:
        app.logger.error(f"Download error: {str(e)}")
        return jsonify({"error": "Failed to generate report"}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)
