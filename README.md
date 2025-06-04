# stats-to-story-genai

Project: Nathan Lyon Dismissal Analyzer
Overview

The Dismissal Analyzer is a full-stack web application that processes cricket statistics to generate AI-powered insights about batsmen dismissed by Nathan Lyon. Users upload a CSV file containing batting records, and the system analyzes the data to produce detailed reports on Lyon's dominance over specific batsmen.
Key Features
 # CSV Data Processing

    Accepts structured CSV files with columns:

        Batsman (Player name)

        Dismissals (Number of times dismissed by Lyon)

        Average (Batting average against Lyon)

        Years (Active years of the batsman)

    Validates file format and required columns before processing.

# AI-Powered Cricket Analysis

    Uses Groq’s LLM API (with Llama 3) to generate ESPN-style narratives about Lyon’s performances.

    Each report includes:

        Key matches and venues

        Technical weaknesses exploited

        Career impact statistics

        Engaging sports journalism-style storytelling

# Interactive Frontend

    Drag-and-drop CSV upload

    Real-time validation and error handling

    Loading spinners during AI processing

    Clean, responsive UI with:

        Batsman-specific story cards

        Dismissal statistics visualization

# Report Generation & Download

    Compiles all analyses into a downloadable TXT file with:

        Consistent formatting

        Player-specific sections

        Statistical summaries
