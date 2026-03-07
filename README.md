# Byte_breakers_1420
 # IMP NOTE : THE GIVEN STEPS/DETAILS IMPLIES ON MODEL2 AND MODEL 1 IS RULE BASED
# AGENT PAPERPAL
An intelligent, AI-powered tool that automatically formats academic manuscripts in APA 7th, MLA 9th, or IEEE style. Features dual-LLM backend (Groq + OpenAI fallback) and supports multiple input formats.
# Features
Multi-Format Input: Accepts `.docx`, `.pdf`, and `.doc` files
Smart Style Detection: Automatically detects APA, MLA, or IEEE from content
Complete Formatting: Applies ALL official style rules including:
  - Title page / first page formatting
  - All heading levels (1-5)
  - Body paragraphs with proper indentation
  - Block quotations
  - Tables and figures
  - Bibliography/References/Works Cited
  - Page headers and running heads
  - Footnotes
  Dual-LLM Architecture: 
  - Primary: Groq LLaMA-3.3-70B
  - Fallback: OpenAI GPT-4o
  Comprehensive Validation: Checks compliance and fixes issues
  Detailed Reports: Generates full formatting reports
#  Quick Start
# Installation
1. Clone the repository:
```
git clone https://github.com/GurujyotSingh/Byte_breakers_1420.git
cd Byte_breakers_1420
```
3. Install Dependencies
pip install -r requirement.txt

4. Set up API keys
# For Groq (primary)
```
export GROQ_API_KEY="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"
```
# For OpenAI (fallback)
```
export OPENAI_API_KEY="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"
```
# Supported Style Rules
# APA 7th Edition
-Title page (centered, bold title)
-Abstract (no indent, keywords)
-All 5 heading levels
-Body paragraphs (0.5" first-line indent)
-Block quotes (≥40 words, 0.5" indent)
-Reference list (hanging indent, DOI format)
-Page numbers (right-aligned)
-Professional running head option

# MLA 9th Edition
-First-page header
-Centered title
-All heading levels
-Body paragraphs 
-Block quotes 
-Works Cited 
-Running header

# IEEE
-Two-column layout
-Title block (24pt centered)
-Abstract with inline label
-Index Terms
-3 heading levels with numbering
-Justified text
-References [N] format
-Table/Figure formatting

The formatter uses a 5-stage pipeline:

1.Detect → Auto-detects citation style using multiple signals
2.Parse → Analyzes document structure
3.Format → Applies complete style rules
4.Validate → Checks compliance
5.Fix → Resolves remaining issues

# Example Output
![PAPERPAL_IMAGE](https://github.com/user-attachments/assets/5cb2fbf8-e9c8-4903-9487-1a936a8c033c)

