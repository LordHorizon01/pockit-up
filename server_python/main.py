"""
PockitUp Python AI & Compute Microservice
High-performance asynchronous backend providing document intelligence, NLP summarization,
and media processing foundation.
"""

import re
import math
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="PockitUp AI & Compute Engine",
    description="Microservice providing fast document parsing, NLP extraction, and vision intelligence",
    version="1.0.0"
)

# Allow the local Vite development servers.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
        "http://127.0.0.1:3000"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Content safety patterns
SAFETY_PATTERNS = [
    re.compile(r"\b(how to (make|build|assemble|synthesize) (a )?(bomb|explosive|dirty bomb|pipe bomb|c4|ied|grenade|detonator))\b", re.I),
    re.compile(r"\b(assassinate|mass shooting plan|terrorist attack instructions|how to commit suicide|ways to kill myself|self harm instructions)\b", re.I),
    re.compile(r"\b(synthesize ricin|manufacture anthrax|chemical weapon formula|nerve agent recipe)\b", re.I),
    re.compile(r"\b(ransomware source code|keylogger payload|trojan malware build|ddos botnet script|how to hack bank account)\b", re.I),
    re.compile(r"\b(credit card skimmer|stolen credit cards dump|counterfeit currency tutorial|identity theft guide)\b", re.I),
    re.compile(r"\b(how to (synthesize|cook|manufacture|make) (methamphetamine|heroin|fentanyl|crack cocaine))\b", re.I),
    re.compile(r"\b(hardcore porn|nsfw explicit sex|child exploitation|non-consensual sexual|abusive taboo sexual)\b", re.I)
]

def check_content_safety(text: str) -> Dict[str, Any]:
    sample = text[:150000]
    for pat in SAFETY_PATTERNS:
        if pat.search(sample):
            return {
                "safe": False,
                "reason": "Restricted prohibited content detected: This document violates safety guidelines (harmful, dangerous, illegal, weapons, malware, or 18+ taboo explicit content). Processing halted."
            }
    return {"safe": True, "reason": ""}

STOPWORDS = {
    'the','and','to','of','a','in','that','is','was','for','it','with','as','by','on','at','this','be','are','from',
    'or','an','which','you','will','not','have','has','we','our','can','all','more','also','their','about','each'
}

def extract_sentences(text: str) -> List[str]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    results = []
    for line in lines:
        cleaned = re.sub(r'\b(Mr|Mrs|Ms|Dr|Prof|Sr|Jr|vs|etc|e\.g|i\.e)\.', r'\1_DOT_', line)
        sents = re.split(r'(?<=[.?!])\s+(?=[A-Z0-9"\'])', cleaned)
        for s in sents:
            restored = s.replace('_DOT_', '.').strip()
            if len(restored) > 15:
                results.append(restored)
            elif len(line) > 20 and not results:
                results.append(line)
    return results

def split_into_sections(text: str) -> List[Dict[str, Any]]:
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    sections = []
    current_title = ""
    current_lines = []

    heading_regex = re.compile(r"^((\d+[\.\)]\s+.*)|([A-Z][A-Za-z0-9\s\-_]{2,45}:)|(Chapter\s+\d+.*)|(Section\s+\d+.*)|([A-Z\s]{4,40}))$")

    for line in lines:
        is_heading = bool(heading_regex.match(line)) and len(line) < 70 and not line.endswith('.')
        if is_heading and current_lines:
            sections.append({
                "title": current_title or "Overview & Background",
                "text": " ".join(current_lines)
            })
            current_title = line
            current_lines = []
        else:
            if not current_title and is_heading:
                current_title = line
            else:
                current_lines.append(line)

    if current_lines:
        sections.append({
            "title": current_title or "Document Scope & Details",
            "text": " ".join(current_lines)
        })

    if len(sections) <= 1:
        paragraphs = [p.strip() for p in re.split(r"\r?\n\s*\r?\n", text) if len(p.strip()) > 30]
        if len(paragraphs) > 1:
            return [
                {
                    "title": f"Section {idx+1}: {p.split()[0:5]}...",
                    "text": p
                }
                for idx, p in enumerate(paragraphs)
            ]
        words = text.split()
        chunk_size = 250
        chunked = []
        for i in range(0, len(words), chunk_size):
            chunk_words = words[i:i + chunk_size]
            chunked.append({
                "title": f"Block {(i // chunk_size) + 1}: {' '.join(chunk_words[:5])}...",
                "text": " ".join(chunk_words)
            })
        return chunked

    return sections

# Request models
class SummarizeRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Raw document or notes text")
    format: str = Field(default="executive", description="Summary format")
    length_mode: str = Field(default="standard", description="Summary length depth")
    title: str = Field(default="Document", description="Document title")

@app.get("/health")
def health_check():
    return {
        "status": "online",
        "service": "pockitup-ai-engine",
        "version": "1.0.0",
        "runtime": "Python 3.13 FastAPI",
        "capabilities": ["nlp_summarize", "section_decomposition", "content_safety", "media_prep"]
    }

@app.post("/api/ai/summarize")
def summarize_document(req: SummarizeRequest):
    safety = check_content_safety(req.text)
    if not safety["safe"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=safety["reason"]
        )

    sentences = extract_sentences(req.text)
    if not sentences:
        return {
            "summary_text": req.text,
            "topics": ["Document"],
            "tone": "General",
            "sections_analyzed": 1,
            "original_words": len(req.text.split()),
            "summary_words": len(req.text.split())
        }

    # Rank recurring terms for topic suggestions.
    raw_words = re.findall(r"\b[a-zA-Z]{3,}\b", req.text.lower())
    freq = {}
    for w in raw_words:
        if w not in STOPWORDS:
            freq[w] = freq.get(w, 0) + 1

    top_topics = [w.capitalize() for w, _ in sorted(freq.items(), key=lambda item: item[1], reverse=True)[:7]]

    # Choose a broad tone label from domain terms.
    lower_all = req.text.lower()
    if any(k in lower_all for k in ['research', 'hardware', 'sensor', 'protocol', 'algorithm', 'controller']):
        tone = "Technical & Scientific"
    elif any(k in lower_all for k in ['revenue', 'market', 'strategy', 'quarterly', 'financial']):
        tone = "Business & Financial"
    else:
        tone = "Professional"

    # Preserve section-level output for full-document requests.
    if req.format == "full_file" or req.length_mode == "full_depth":
        sections = split_into_sections(req.text)
        summaries = []
        for sec in sections:
            sec_sents = extract_sentences(sec["text"])
            if len(sec_sents) <= 2:
                sec_summary = " ".join(sec_sents) or sec["text"]
                sec_bullets = []
            else:
                scored = []
                for s in sec_sents:
                    sc = sum(freq.get(w, 0) for w in re.findall(r"\b[a-zA-Z]{3,}\b", s.lower()))
                    scored.append((sc, s))
                scored.sort(key=lambda x: x[0], reverse=True)
                sec_summary = scored[0][1]
                sec_bullets = [s[1] for s in scored[1:4]]

            summaries.append({
                "title": sec["title"],
                "words": len(sec["text"].split()),
                "summary": sec_summary,
                "bullets": sec_bullets
            })

        lead = sentences[0] if sentences else "Full document overview."
        plain = f"FULL FILE SUMMARY ({len(summaries)} Sections Analyzed)\nExecutive Synthesis: {lead}\n\n"
        for idx, s in enumerate(summaries, 1):
            plain += f"{idx}. {s['title']} ({s['words']} words)\n{s['summary']}\n"
            for b in s['bullets']:
                plain += f"• {b}\n"
            plain += "\n"

        return {
            "summary_text": plain.strip(),
            "topics": top_topics,
            "tone": tone,
            "sections": summaries,
            "sections_analyzed": len(summaries),
            "original_words": len(req.text.split()),
            "summary_words": len(plain.split())
        }

    # Produce the requested summary format.
    scored_all = []
    for idx, sent in enumerate(sentences):
        sc = sum(freq.get(w, 0) for w in re.findall(r"\b[a-zA-Z]{3,}\b", sent.lower()))
        if idx < 3:
            sc *= 1.35
        scored_all.append((sc, sent))

    scored_all.sort(key=lambda x: x[0], reverse=True)
    limit = 6 if req.length_mode == "concise" else (20 if req.length_mode == "detailed" else 12)
    top_sents = [s[1] for s in scored_all[:limit]]

    if req.format == "executive":
        tldr = top_sents[0] if top_sents else ""
        bullets = top_sents[1:6]
        plain = f"TL;DR Executive Summary:\n{tldr}\n\nCore Findings & Highlights:\n" + "\n".join(f"• {b}" for b in bullets)
    elif req.format == "bullets":
        plain = "\n\n".join(f"{i+1}. {s}" for i, s in enumerate(top_sents[:8]))
    else:
        plain = " ".join(top_sents)

    return {
        "summary_text": plain,
        "topics": top_topics,
        "tone": tone,
        "sections_analyzed": 1,
        "original_words": len(req.text.split()),
        "summary_words": len(plain.split())
    }

@app.post("/api/ai/describe-image")
async def describe_image_endpoint(file: UploadFile = File(...)):
    """Foundation endpoint for the upcoming AI Image Describer tool."""
    try:
        from PIL import Image
        import io
        contents = await file.read()
        img = Image.open(io.BytesIO(contents))
        width, height = img.size
        img_format = img.format or "UNKNOWN"
        mode = img.mode

        return {
            "filename": file.filename,
            "dimensions": f"{width}x{height}",
            "format": img_format,
            "color_mode": mode,
            "description": f"Visual asset '{file.filename}' ({img_format}, {width}x{height} px) successfully ingested and ready for multi-modal feature vector extraction.",
            "ready": True
        }
    except Exception as e:
        return {
            "filename": file.filename,
            "description": f"Image file received: {file.filename}. Ready for visual captioning.",
            "ready": True
        }
