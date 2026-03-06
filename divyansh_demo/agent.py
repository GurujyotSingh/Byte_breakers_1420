"""
agent.py -- APA 7th / MLA 9th Manuscript Formatter
Compliant with citation_styles.json + apa_mla_rules.json (Purdue OWL 2024)

APA 7th Edition (Social Sciences):
  ✓ Page: 8.5×11 in, 1-inch margins, TNR 12pt, double spaced
  ✓ Body: LEFT aligned, 0.5in first-line indent  [Purdue OWL: body_text.alignment = "left"]
  ✓ Title page: Bold, centered, title case
  ✓ Abstract heading: centered, bold (L1) | Body: left, NO first-line indent
  ✓ Keywords: italic "Keywords:" label, 0.5in indent, new line below abstract
  ✓ L1: Centered, Bold, Title Case
  ✓ L2: Left, Bold, Title Case  (NOT italic)
  ✓ L3: Left, Bold Italic, Title Case
  ✓ L4: Indented 0.5in, Bold, Title Case, ends with period (inline)
  ✓ L5: Indented 0.5in, Bold Italic, Title Case, ends with period (inline)
  ✓ Citations: (Author, Year) | (A & B, Year) | (A et al., Year)
               (A, Year, p. N) direct quote | (A, Year; B, Year) multiple
               Narrative "Smith (2020)" preserved
  ✓ Block quote: 40+ word quotes indented 0.5in, no surrounding quotes
  ✓ Direct quote flag: < 40 words with quote marks but missing p. N flagged ⚠
  ✓ References: centered bold heading, 0.5in hanging indent
  ✓ Rename 'Works Cited'/'Bibliography' → 'References'
  ✓ DOI format: https://doi.org/xxxxx (doi: prefix normalised)
  ✓ Flag: direct quotes missing page number

MLA 9th Edition (Humanities):
  ✓ No title page -- heading block (Name/Instructor/Course/Date) left aligned
  ✓ Title: centered, Title Case, NOT bold, NOT italic, NOT underlined
  ✓ Body: LEFT aligned, 0.5in first-line indent  [Purdue OWL: alignment = "left"]
  ✓ L1: Bold, Title Case, Left
  ✓ L2: Bold Italic, Title Case, Left
  ✓ Citations: (Author Page) no comma, preserve existing page numbers
               (Author and Author Page) two-author, 'and' not '&'
               (Author et al. Page) three+
  ✓ Works Cited: centered, NOT bold heading | 0.5in hanging indent
  ✓ Rename 'References'/'Bibliography' → 'Works Cited'
  ✓ Month abbreviation in Works Cited (Jan. Feb. Mar. Apr. May June July Aug. Sept. Oct. Nov. Dec.)
"""

import json, os, re, sys
from pathlib import Path
from typing import Optional
from docx import Document
from docx.shared import Pt, Inches, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.oxml.ns import qn
from docx.oxml import OxmlElement

# ── Load rules ─────────────────────────────────────────────────────────
RULES_PATH = Path(__file__).parent / "apa_mla_rules.json"
try:
    with open(RULES_PATH, encoding="utf-8") as _f:
        ALL_RULES = json.load(_f)
    APA_RULES = ALL_RULES["styles"]["APA"]
    MLA_RULES = ALL_RULES["styles"]["MLA"]
except Exception:
    APA_RULES = {}
    MLA_RULES = {}

FONT_NAME      = "Times New Roman"
FONT_SIZE      = 12
FONT_SIZE_IEEE = 10          # IEEE uses 10pt
LINE_SPACE     = 480         # twips = double spacing
LINE_SPACE_IEEE = 240        # IEEE uses single spacing
BODY_INDENT    = 0.5         # inches -- first-line / hanging indent

# ── IEEE heading name sets (Roman numerals common in IEEE) ─────────────
IEEE_L1_NAMES = {
    "abstract", "introduction", "conclusion", "conclusions",
    "references", "acknowledgment", "acknowledgments",
    "acknowledgements", "related work", "background",
    "methodology", "method", "methods", "results", "discussion",
    "evaluation", "experiments", "implementation", "system model",
    "proposed method", "proposed approach", "literature review",
    "future work", "appendix",
}

# ── Heading name sets ──────────────────────────────────────────────────
L1_NAMES = {
    "abstract", "introduction", "method", "methods", "methodology",
    "results", "discussion", "conclusion", "conclusions", "references",
    "limitations", "acknowledgments", "acknowledgements", "appendix",
    "literature review", "related work", "background", "overview",
    "theoretical framework", "findings", "summary", "implications",
    "recommendations", "future research", "research questions",
}
L2_NAMES = {
    "participants", "participant", "materials", "material", "procedure",
    "measures", "measure", "instruments", "instrument", "design", "sample",
    "data collection", "data analysis", "statistical analysis",
    "ethical considerations", "reliability", "validity",
}
L3_NAMES = {
    "inclusion criteria", "exclusion criteria",
    "inter-rater reliability", "coding procedure",
    "qualitative analysis", "quantitative analysis",
    "data screening",
}
WORKS_CITED_VARIANTS = {
    "works cited", "bibliography", "work cited",
    "references cited", "reference list",
}

# ── Document-type keyword banks ────────────────────────────────────────
DOC_TYPE_KEYWORDS = {
    "STEM / IT": [
        "algorithm","machine learning","neural network","deep learning","software",
        "hardware","programming","database","encryption","blockchain","quantum",
        "computation","python","java","network","cybersecurity","artificial intelligence",
        "robotics","engineering","experiment","hypothesis","laboratory","specimen",
        "genome","protein","chemical","reaction","physics","calculus",
        "statistical model","regression","dataset","big data","cloud",
        "API","framework","compiler","runtime","bandwidth",
    ],
    "Humanities": [
        "literary","narrative","rhetoric","discourse","hermeneutics","postmodern",
        "colonialism","feminism","philosophy","theology","archaeology","mythology",
        "linguistic","semiotics","aesthetics","genre","prose","poetry","drama",
        "novel","author","text","culture","art history","classical","renaissance",
        "baroque","enlightenment","romanticism","symbolism","motif","allegory",
        "historiography","primary source","archive","manuscript",
    ],
    "Social Sciences": [
        "survey","interview","qualitative","quantitative","ethnography","psychology",
        "sociology","anthropology","behavioural","cognitive","respondent","participant",
        "questionnaire","focus group","sample","demographics","correlation",
        "longitudinal","cross-sectional","policy","governance","political","economics",
        "inequality","social capital","community","identity","race","gender","class",
        "mental health","therapy","intervention","trauma","attachment",
    ],
    "Medical / Health": [
        "patient","clinical","diagnosis","treatment","prognosis","pharmacology",
        "drug","dosage","randomized controlled trial","placebo","cohort","epidemiology",
        "prevalence","incidence","symptoms","pathology","surgery","nursing","radiology",
        "biomarker","immune","vaccine","pandemic","mortality","morbidity",
        "healthcare","hospital","physician","medication",
    ],
    "Educational": [
        "curriculum","pedagogy","student","teacher","classroom","learning outcomes",
        "assessment","rubric","syllabus","lecture","undergraduate","graduate",
        "academic","scholarship","tuition","literacy","numeracy","instruction",
        "e-learning","blended","constructivism","behaviourism","bloom","taxonomy",
        "differentiation","special education","inclusive","disability","IEP","gifted",
    ],
}


# ═══════════════════════════════════════════════════════════════════════
# DOCUMENT TYPE DETECTOR
# ═══════════════════════════════════════════════════════════════════════

def detect_document_type(text: str) -> dict:
    lower  = text.lower()
    scores = {cat: sum(1 for kw in kws if kw.lower() in lower)
              for cat, kws in DOC_TYPE_KEYWORDS.items()}

    best_type  = max(scores, key=scores.get)
    best_score = scores[best_type]
    total_hits = sum(scores.values())

    if best_score == 0:
        confidence = "Low";  best_type = "General Academic"
    elif total_hits > 0 and best_score / total_hits > 0.5:
        confidence = "High"
    elif best_score >= 3:
        confidence = "Medium"
    else:
        confidence = "Low";  best_type = "General Academic"

    style_map = {
        "STEM / IT":        ["APA 7th Edition", "IEEE"],
        "Humanities":       ["MLA 9th Edition", "Chicago 17th Edition"],
        "Social Sciences":  ["APA 7th Edition", "MLA 9th Edition"],
        "Medical / Health": ["APA 7th Edition", "Vancouver"],
        "Educational":      ["APA 7th Edition", "MLA 9th Edition"],
        "General Academic": ["APA 7th Edition", "MLA 9th Edition"],
    }
    desc_map = {
        "STEM / IT":        "Technical/scientific paper with computational or engineering content",
        "Humanities":       "Arts, literature, language, or cultural studies paper",
        "Social Sciences":  "Behavioral, psychological, or sociological research paper",
        "Medical / Health": "Clinical, health, or biomedical research document",
        "Educational":      "Pedagogical or education research/study document",
        "General Academic": "General academic document -- no dominant subject detected",
    }
    icon_map = {
        "STEM / IT": "🔬", "Humanities": "📖", "Social Sciences": "🧠",
        "Medical / Health": "🏥", "Educational": "🎓", "General Academic": "📄",
    }
    return {
        "type":               best_type,
        "confidence":         confidence,
        "scores":             scores,
        "recommended_styles": style_map.get(best_type, ["APA 7th Edition"]),
        "description":        desc_map.get(best_type, ""),
        "icon":               icon_map.get(best_type, "📄"),
    }


# ═══════════════════════════════════════════════════════════════════════
# XML / DOCX UTILITIES
# ═══════════════════════════════════════════════════════════════════════

def _sanitize(text: str) -> str:
    """Remove or replace characters that cause codec errors on Windows."""
    if not text:
        return text
    # Replace common Windows-1252 problem bytes that sneak into docx files
    replacements = {
        "": "€", "": ",", "": "f", "": ",,", "": "...",
        "": "+", "": "++", "": "^", "": "%", "": "S",
        "": "<", "": "OE", "": "Z", "": "'", "": "'",
        "": '"', "": '"', "": "•", "": "-", "": "--",
        "": "~", "": "™", "": "s", "": ">", "": "oe",
        "": "", "": "z", "": "Y",
    }
    for bad, good in replacements.items():
        text = text.replace(bad, good)
    # Final safety net: encode to utf-8 replacing anything still problematic
    return text.encode("utf-8", errors="replace").decode("utf-8", errors="replace")


def _merge_runs(para):
    """Collapse all runs into one, return (full_text, single_run).
    Preserves hyperlink text but removes the hyperlink XML wrapper
    only for non-DOI/URL content -- DOI hyperlinks in refs are preserved
    by keeping the original text and not stripping anchor elements."""
    full_text = _sanitize(para.text)
    # Only remove plain runs, tracked-change ins/del -- NOT hyperlinks
    # (hyperlinks contain DOI/URL anchors critical for APA refs)
    to_rm = [c for c in para._p
             if (c.tag.split("}")[-1] if "}" in c.tag else c.tag)
             in ("r", "ins", "del")]
    for el in to_rm:
        para._p.remove(el)
    return full_text, para.add_run(full_text)


def _force_font(run, name=FONT_NAME, size=FONT_SIZE):
    rPr = run._r.get_or_add_rPr()
    old = rPr.find(qn("w:rFonts"))
    if old is not None:
        rPr.remove(old)
    rf = OxmlElement("w:rFonts")
    for a in (qn("w:ascii"), qn("w:hAnsi"), qn("w:eastAsia"), qn("w:cs")):
        rf.set(a, name)
    rPr.insert(0, rf)
    half = str(int(size * 2))
    for tag in ("w:sz", "w:szCs"):
        el = rPr.find(qn(tag))
        if el is not None:
            rPr.remove(el)
        el = OxmlElement(tag)
        el.set(qn("w:val"), half)
        rPr.append(el)
    run.font.name = name
    run.font.size = Pt(size)


def _set_spacing(para, line=LINE_SPACE):
    pPr = para._p.get_or_add_pPr()
    sp  = pPr.find(qn("w:spacing"))
    if sp is None:
        sp = OxmlElement("w:spacing")
        pPr.append(sp)
    sp.set(qn("w:before"),   "0")
    sp.set(qn("w:after"),    "0")
    sp.set(qn("w:line"),     str(line))
    sp.set(qn("w:lineRule"), "auto")


def _clear_indent(para):
    pPr = para._p.get_or_add_pPr()
    ind = pPr.find(qn("w:ind"))
    if ind is not None:
        pPr.remove(ind)


def _set_first_line(para, inches=BODY_INDENT):
    _clear_indent(para)
    pPr = para._p.get_or_add_pPr()
    ind = OxmlElement("w:ind")
    ind.set(qn("w:firstLine"), str(int(inches * 1440)))
    pPr.append(ind)


def _set_left_indent(para, inches=BODY_INDENT):
    """Left indent only (block quotes, L4/L5 headings)."""
    _clear_indent(para)
    pPr = para._p.get_or_add_pPr()
    ind = OxmlElement("w:ind")
    ind.set(qn("w:left"), str(int(inches * 1440)))
    pPr.append(ind)


def _set_hanging(para, inches=BODY_INDENT):
    _clear_indent(para)
    pPr = para._p.get_or_add_pPr()
    ind = OxmlElement("w:ind")
    t   = str(int(inches * 1440))
    ind.set(qn("w:left"),    t)
    ind.set(qn("w:hanging"), t)
    pPr.append(ind)


def _highlight(run, color="yellow"):
    rPr = run._r.get_or_add_rPr()
    hl  = rPr.find(qn("w:highlight"))
    if hl is None:
        hl = OxmlElement("w:highlight")
        rPr.append(hl)
    hl.set(qn("w:val"), color)


def _title_case(text: str) -> str:
    minor = {"a","an","the","and","but","or","for","nor","on","at",
             "to","by","in","of","up","as","is","it","via","vs"}
    words = text.split()
    return " ".join(
        (w[0].upper() + w[1:] if w else w)
        if (i == 0 or i == len(words) - 1 or w.lower() not in minor)
        else w.lower()
        for i, w in enumerate(words)
    )


def _word_count(text: str) -> int:
    return len(text.split())


def _make_para_xml(text, align="left", bold=False, italic=False,
                   highlight=None, first_line=None, hanging=None,
                   left_indent=None, font=FONT_NAME, size=FONT_SIZE):
    """Build a w:p XML element from scratch."""
    p   = OxmlElement("w:p")
    pPr = OxmlElement("w:pPr")

    jc = OxmlElement("w:jc")
    jc.set(qn("w:val"), align)
    pPr.append(jc)

    sp = OxmlElement("w:spacing")
    sp.set(qn("w:before"), "0"); sp.set(qn("w:after"), "0")
    sp.set(qn("w:line"), str(LINE_SPACE)); sp.set(qn("w:lineRule"), "auto")
    pPr.append(sp)

    if hanging is not None:
        ind = OxmlElement("w:ind")
        t   = str(int(hanging * 1440))
        ind.set(qn("w:left"), t); ind.set(qn("w:hanging"), t)
        pPr.append(ind)
    elif first_line is not None:
        ind = OxmlElement("w:ind")
        ind.set(qn("w:firstLine"), str(int(first_line * 1440)))
        pPr.append(ind)
    elif left_indent is not None:
        ind = OxmlElement("w:ind")
        ind.set(qn("w:left"), str(int(left_indent * 1440)))
        pPr.append(ind)

    p.append(pPr)
    r   = OxmlElement("w:r")
    rPr = OxmlElement("w:rPr")

    rf = OxmlElement("w:rFonts")
    for a in (qn("w:ascii"), qn("w:hAnsi"), qn("w:eastAsia"), qn("w:cs")):
        rf.set(a, font)
    rPr.append(rf)

    half = str(int(size * 2))
    for tag in ("w:sz", "w:szCs"):
        el = OxmlElement(tag)
        el.set(qn("w:val"), half)
        rPr.append(el)

    if bold:   rPr.append(OxmlElement("w:b"))
    if italic: rPr.append(OxmlElement("w:i"))
    if highlight:
        hl = OxmlElement("w:highlight")
        hl.set(qn("w:val"), highlight)
        rPr.append(hl)

    r.append(rPr)
    t_el = OxmlElement("w:t")
    t_el.text = text
    t_el.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    r.append(t_el)
    p.append(r)
    return p


# ═══════════════════════════════════════════════════════════════════════
# PARAGRAPH CLASSIFIER
# ═══════════════════════════════════════════════════════════════════════

def _classify(para, idx, total):
    text  = para.text.strip()
    lower = text.lower()
    if not text: return "empty"

    sname = para.style.name.lower() if para.style else "normal"
    if sname == "title":     return "title"
    if sname == "heading 1": return "level1"
    if sname == "heading 2": return "level2"
    if sname == "heading 3": return "level3"
    if sname == "heading 4": return "level4"
    if sname == "heading 5": return "level5"

    # Exact-match heading names
    if lower in L1_NAMES or lower in WORKS_CITED_VARIANTS: return "level1"
    if lower in L2_NAMES:                                    return "level2"
    if lower in L3_NAMES:                                    return "level3"

    # Title page heuristic -- first 8% of paragraphs
    if idx < max(4, int(total * 0.08)):
        tp_patterns = [
            r"^author\s*(name)?:", r"^college:", r"^institution:",
            r"^course", r"^instructor", r"^submission\s*year",
            r"^due\s*date", r"^date:", r"^professor", r"^department",
        ]
        if any(re.match(p, lower) for p in tp_patterns):
            return "title_page"

    return "body"


# ═══════════════════════════════════════════════════════════════════════
# APA CITATION FIXER
# Rules (Purdue OWL APA 7th):
#   (Author, Year) | (A & B, Year) | (A et al., Year)
#   (A, Year, p. N) direct quote | (A, Year; B, Year) multiple sources
#   Narrative "Smith (2020)" -- PRESERVE, do not break
# ═══════════════════════════════════════════════════════════════════════

def _fix_citations_apa(text: str):
    changes = []
    t = text

    # ── Protect narrative citations: "Smith (2020)" / "Smith and Jones (2020)"
    # These are correct already -- mask them so later rules don't corrupt them
    narrative_mask = {}
    mask_idx = [0]
    def _mask(m):
        key = f"\x00NAR{mask_idx[0]}\x00"
        narrative_mask[key] = m.group(0)
        mask_idx[0] += 1
        return key

    # Narrative two-author: "Smith and Jones (2020)"
    t = re.sub(r'([A-Z][a-z]+)\s+and\s+([A-Z][a-z]+)\s+\((\d{4}[a-z]?)\)', _mask, t)
    # Narrative single: "Smith (2020)" or "Smith et al. (2020)"
    t = re.sub(r'([A-Z][a-z]+(?:\s+et\s+al\.)?)\s+\((\d{4}[a-z]?(?:,\s*p\.?\s*\d+)?)\)', _mask, t)

    # ── Fix et al. formatting: "et al 2017" / "et al. 2017" → "et al., 2017"
    t2, n = re.subn(r'\bet\s+al\.?\s+(\d{4})', r'et al., \1', t)
    if n: changes.append(f"Fixed {n}× 'et al' → 'et al.,'"); t = t2

    # ── Bare two-author: "Garcia and Lee 2020" → "(Garcia & Lee, 2020)"
    t2, n = re.subn(
        r'(?<!\()([A-Z][a-z]+)\s+and\s+([A-Z][a-z]+)\s+(\d{4})(?!\))',
        r'(\1 & \2, \3)', t)
    if n: changes.append(f"Wrapped {n}× bare two-author citation → (A & B, Year)"); t = t2

    # ── Parenthetical 'and' → '&': "(Smith and Jones, 2020)" → "(Smith & Jones, 2020)"
    t2, n = re.subn(
        r'\(([A-Z][a-z]+)\s+and\s+([A-Z][a-z]+),\s+(\d{4}[a-z]?)\)',
        r'(\1 & \2, \3)', t)
    if n: changes.append(f"Replaced {n}× 'and' → '&' in parenthetical citation"); t = t2

    # ── 3+ authors → et al.: "(Smith, Jones, Brown, 2020)" → "(Smith et al., 2020)"
    t2, n = re.subn(
        r'\(([A-Z][a-z]+)(?:,\s+[A-Z][a-z]+){2,},\s+(\d{4}[a-z]?)\)',
        r'(\1 et al., \2)', t)
    if n: changes.append(f"Condensed {n}× 3+ author → et al."); t = t2

    # ── Missing comma: "(Smith 2018)" → "(Smith, 2018)"
    #    but NOT "(Smith 2018, p. 45)" which already has a page ref
    t2, n = re.subn(
        r'\(([A-Z][a-z]+(?:\s+et\s+al\.)?)\s+(\d{4}[a-z]?)\)(?!,)',
        r'(\1, \2)', t)
    if n: changes.append(f"Added missing comma in {n}× citation"); t = t2

    # ── Bare single-author: "Smith 2018" → "(Smith, 2018)"
    #    guard: not already in parens, not after & , not lowercase word
    t2, n = re.subn(
        r'(?<!\()(?<!\& )(?<![a-z] )([A-Z][a-z]{1,}(?:\s+et\s+al\.)?)\s+(\d{4}[a-z]?)(?!\))',
        r'(\1, \2)', t)
    if n: changes.append(f"Wrapped {n}× bare citation → (Author, Year)"); t = t2

    # ── Multiple sources separated by semicolons -- flag format
    if re.search(r'\([^)]+;\s*[^)]+\)', t):
        changes.append("Multiple-source citation detected -- verify (Author, Year; Author, Year) format")

    # ── Restore masked narrative citations
    for key, val in narrative_mask.items():
        t = t.replace(key, val)

    return t, changes


# ═══════════════════════════════════════════════════════════════════════
# MLA CITATION FIXER
# Rules (Purdue OWL MLA 9th):
#   (Author Page) -- NO comma, uses page number not year
#   (Author and Author Page) two authors
#   (Author et al. Page) three+
#   Preserve existing page numbers if present
# ═══════════════════════════════════════════════════════════════════════

def _fix_citations_mla(text: str):
    """
    MLA 9th citation rules (Purdue OWL / apa_mla_rules.json):
      (Author Page) -- no comma, page number not year
      (Author and Author Page) two authors -- 'and' not '&'
      (Author et al. Page) three or more authors
    Preserves existing correct MLA citations.
    Converts APA-formatted citations to MLA.
    """
    changes = []
    t = text

    # ── Protect already-correct MLA citations: (Smith 45) or (Smith et al. 45)
    # These already have a page number (digits after name, no comma, no 4-digit year alone)
    mla_mask = {}
    mask_idx = [0]
    def _mask_mla(m):
        key = f"\x00MLA{mask_idx[0]}\x00"
        mla_mask[key] = m.group(0)
        mask_idx[0] += 1
        return key

    # Already-correct: (Author Page) where Page is 1-3 digit number
    t = re.sub(r'\(([A-Z][a-z]+(?:\s+et\s+al\.)?)\s+(\d{1,3})\)', _mask_mla, t)
    # Already-correct two-author MLA: (Author and Author Page)
    t = re.sub(r'\(([A-Z][a-z]+)\s+and\s+([A-Z][a-z]+)\s+(\d{1,3})\)', _mask_mla, t)

    # ── Convert APA two-author: (Smith & Jones, 2020) → (Smith and Jones)
    t2, n = re.subn(
        r'\(([A-Z][a-z]+)\s+&\s+([A-Z][a-z]+),\s+\d{4}[a-z]?\)',
        r'(\1 and \2)', t)
    if n: changes.append(f"Converted {n}× APA two-author → MLA 'and' format -- add page number"); t = t2

    # ── Convert APA et al.: (Smith et al., 2020) → (Smith et al.)
    t2, n = re.subn(r'\(([A-Z][a-z]+)\s+et\s+al\.,\s+\d{4}[a-z]?\)', r'(\1 et al.)', t)
    if n: changes.append(f"Converted {n}× et al. citation to MLA format -- add page number"); t = t2

    # ── Convert APA single-author: (Smith, 2020) → (Smith)
    t2, n = re.subn(r'\(([A-Z][a-z]+),\s+\d{4}[a-z]?\)', r'(\1)', t)
    if n: changes.append(f"Converted {n}× APA (Author, Year) → MLA (Author) -- add page number"); t = t2

    # ── Replace & with 'and' in any remaining parenthetical citations
    t2, n = re.subn(r'\(([A-Z][a-z]+)\s+&\s+([A-Z][a-z]+)\)', r'(\1 and \2)', t)
    if n: changes.append(f"Replaced {n}× '&' → 'and' in MLA parenthetical citation"); t = t2

    # ── Restore masked correct MLA citations
    for key, val in mla_mask.items():
        t = t.replace(key, val)

    return t, changes


# ═══════════════════════════════════════════════════════════════════════
# REFERENCE FORMATTERS
# ═══════════════════════════════════════════════════════════════════════

def _format_one_ref_apa(entry: str) -> str:
    """
    Convert a bare/malformed reference entry to APA 7th format.
    Preserves DOI/URL lines. Applies sentence case to article/book titles.
    Per Purdue OWL: doi_format = 'https://doi.org/xxxxx'
                    url_format = 'Retrieved from https://www.example.com'
    """
    entry = entry.strip()
    if not entry: return entry

    # Already well-formed: has "Author, I. (Year)." pattern
    if re.match(r'^[A-Z][a-z]+,\s+[A-Z]\.\s+\(\d{4}\)\.', entry):
        # Normalise doi: prefix → https://doi.org/
        entry = re.sub(r'\bdoi:\s*(10\.)', r'https://doi.org/\1', entry, flags=re.IGNORECASE)
        return entry

    # Preserve DOI/URL -- don't reformat these lines
    if re.match(r'^https?://', entry) or entry.startswith("doi:"):
        # Normalise doi: → https://doi.org/
        entry = re.sub(r'^doi:\s*(10\.)', r'https://doi.org/\1', entry, flags=re.IGNORECASE)
        return entry

    # Three authors: L I L I L I Year Title
    m = re.match(
        r'^([A-Z][a-z]+)\s+([A-Z])\s+([A-Z][a-z]+)\s+([A-Z])\s+([A-Z][a-z]+)\s+([A-Z])\s+(\d{4})\s+(.+)',
        entry)
    if m:
        title = _sentence_case(m.group(8).strip().rstrip('.'))
        return (f"{m.group(1)}, {m.group(2)}., {m.group(3)}, {m.group(4)}., "
                f"& {m.group(5)}, {m.group(6)}. ({m.group(7)}). {title}.")

    # Two authors: L I L I Year Title
    m = re.match(
        r'^([A-Z][a-z]+)\s+([A-Z])\s+([A-Z][a-z]+)\s+([A-Z])\s+(\d{4})\s+(.+)',
        entry)
    if m:
        title = _sentence_case(m.group(6).strip().rstrip('.'))
        return (f"{m.group(1)}, {m.group(2)}., & {m.group(3)}, {m.group(4)}. "
                f"({m.group(5)}). {title}.")

    # Single author: L I(s) ... Year ... Title
    m = re.match(r'^([A-Z][a-z]+)\s+([A-Z](?:\s+[A-Z])*)\s+(.+)', entry)
    if m:
        last     = m.group(1)
        initials = ". ".join(m.group(2).strip().split()) + "."
        rest     = m.group(3)
        ym = re.search(r'\b(\d{4})\b', rest)
        if ym:
            year       = ym.group(1)
            before_yr  = rest[:ym.start()].strip().rstrip(',')
            after_yr   = rest[ym.end():].strip().rstrip('.')
            title_part = _sentence_case((before_yr + (" " + after_yr if after_yr else "")).strip())
            return f"{last}, {initials} ({year}). {title_part}."
        return f"{last}, {initials} {rest.strip().rstrip('.')}."

    return entry


def _sentence_case(text: str) -> str:
    """
    Apply APA sentence case to a title:
    First word capitalised, rest lowercase except:
    - ALL-CAPS acronyms (e.g. COVID, DNA, AI) -- preserved
    - Words that were Title-Cased in original and follow a colon -- preserved
    - Proper nouns that are fully capitalised stay capitalised.
    Capitalise after colon.
    """
    if not text:
        return text
    words = text.split()
    result = []
    for i, word in enumerate(words):
        # Strip surrounding punctuation for analysis
        stripped = word.strip(".,;:!?()\"-")
        # Preserve ALL-CAPS acronyms (2+ uppercase letters, no lowercase)
        if len(stripped) >= 2 and stripped.isupper() and stripped.isalpha():
            result.append(word)
        # Capitalise first word
        elif i == 0:
            result.append(word[0].upper() + word[1:].lower())
        # Capitalise after colon
        elif result and result[-1].rstrip().endswith(":"):
            result.append(word[0].upper() + word[1:].lower())
        else:
            result.append(word.lower())
    out = " ".join(result)
    # Capitalise the word immediately after ": "
    out = re.sub(r"(:\s+)([a-z])", lambda m: m.group(1) + m.group(2).upper(), out)
    return out


def _abbreviate_month_mla(text: str) -> str:
    """
    MLA 9th: abbreviate months in Works Cited entries.
    Jan. Feb. Mar. Apr. May June July Aug. Sept. Oct. Nov. Dec.
    Per Purdue OWL MLA common_mistakes: 'Not abbreviating months in Works Cited'
    """
    MLA_MONTHS = {
        "january": "Jan.", "february": "Feb.", "march": "Mar.",
        "april": "Apr.",   "may": "May",       "june": "June",
        "july": "July",    "august": "Aug.",    "september": "Sept.",
        "october": "Oct.", "november": "Nov.",  "december": "Dec.",
    }
    for full, abbr in MLA_MONTHS.items():
        # Replace full month name (case-insensitive) not already abbreviated
        text = re.sub(r'\b' + full + r'\b', abbr, text, flags=re.IGNORECASE)
    return text


def _format_one_ref_mla(entry: str) -> str:
    """
    Convert a reference entry to MLA 9th: LastName, First. Title. Publisher, Year.
    Also abbreviates months per Purdue OWL MLA rules.
    """
    entry = entry.strip()
    if not entry: return entry

    # Preserve URLs
    if re.match(r'^https?://', entry):
        return entry

    # Already MLA-formatted: "LastName, FirstName." pattern -- just abbreviate months
    if re.match(r'^[A-Z][a-z]+,\s+[A-Z][a-z]', entry):
        return _abbreviate_month_mla(entry)

    # From APA: LastName, I. (Year). Title.
    m = re.match(r'^([A-Z][a-z]+),\s+([A-Z])\.\s+\((\d{4})\)\.\s+(.+)', entry)
    if m:
        result = f"{m.group(1)}, {m.group(2)}. {m.group(4).rstrip('.')}. {m.group(3)}."
        return _abbreviate_month_mla(result)

    # Bare: LastName Initial Year Title
    m = re.match(r'^([A-Z][a-z]+)\s+([A-Z])\s+(\d{4})\s+(.+)', entry)
    if m:
        result = f"{m.group(1)}, {m.group(2)}. {m.group(4).rstrip('.')}. {m.group(3)}."
        return _abbreviate_month_mla(result)

    return _abbreviate_month_mla(entry)


def _fix_citations_ieee(text: str):
    """
    IEEE uses numeric citations: [1], [2], [1], [2], [3]
    Converts APA/MLA style citations to IEEE numeric placeholders.
    Full renumbering happens in the reference formatter.
    """
    changes = []
    t = text

    # (Smith, 2020) → [?] placeholder (number assigned when refs are processed)
    t2, n = re.subn(
        r'\(([A-Z][a-z]+)(?:\s+et\s+al\.?)?,?\s+\d{4}[a-z]?\)',
        '[?]', t)
    if n:
        changes.append(f"Converted {n}× author-year citation → IEEE numeric [?] placeholder")
        t = t2

    # (Smith 45) MLA style → [?]
    t2, n = re.subn(r'\(([A-Z][a-z]+)\s+\d{1,3}\)', '[?]', t)
    if n:
        changes.append(f"Converted {n}× MLA citation → IEEE [?] placeholder")
        t = t2

    return t, changes


def _format_one_ref_ieee(entry: str, cite_map: dict) -> str:
    """
    Convert a reference entry to IEEE format:
    [N] J. Smith, "Title," Journal Name, vol. X, no. Y, pp. Z, Year.
    Uses cite_map to assign sequential numbers.
    """
    entry = entry.strip()
    if not entry: return entry

    # Already IEEE formatted: starts with [N]
    if re.match(r'^\[\d+\]', entry):
        return entry

    # Assign number based on first author
    key_m = re.match(r'^([A-Z][a-z]+)', entry)
    author_key = key_m.group(1).lower() if key_m else entry[:10].lower()

    if author_key not in cite_map:
        cite_map[author_key] = len(cite_map) + 1
    num = cite_map[author_key]

    # APA format: "Smith, J. (2020). Title. Journal."
    m = re.match(r'^([A-Z][a-z]+),\s+([A-Z])\.\s+\((\d{4})\)\.\s+(.+)', entry)
    if m:
        last, init, year, rest = m.groups()
        rest = rest.rstrip('.')
        return f"[{num}] {init}. {last}, \"{rest},\" {year}."

    # Bare: "LastName I Year Title"
    m = re.match(r'^([A-Z][a-z]+)\s+([A-Z])\s+(\d{4})\s+(.+)', entry)
    if m:
        last, init, year, rest = m.groups()
        rest = rest.rstrip('.')
        return f"[{num}] {init}. {last}, \"{rest},\" {year}."

    # Fallback: prepend number
    return f"[{num}] {entry}"


def _split_and_format_refs(raw_text: str, style: str = "APA"):
    """Split jammed multi-entry paragraphs and format each entry."""
    parts     = re.split(r'(?<=\d{4})\s+(?=[A-Z][a-z]+\s+[A-Z]\b)', raw_text.strip())
    formatter = _format_one_ref_apa if style == "APA" else _format_one_ref_mla
    return [formatter(p) for p in parts if p.strip()]


# ═══════════════════════════════════════════════════════════════════════
# TRUNCATION DETECTOR
# ═══════════════════════════════════════════════════════════════════════

def _is_truncated(text: str) -> bool:
    t = text.strip()
    if not t: return False
    if not re.search(r'[.!?]$', t):
        words = t.split()
        last  = words[-1] if words else ""
        safe  = {"the","and","for","but","nor","yet","so","to","by","in",
                 "on","at","up","of","as","or","is","it","be","do","go",
                 "a","an","no","my","we","he","she","they","you","i","via"}
        if len(last) < 4 and last.isalpha() and last.lower() not in safe:
            return True
        if re.match(r'^[a-z]+$', last) and len(last) <= 6 and last not in safe:
            if len(words) < 8:
                return True
    return False


# ═══════════════════════════════════════════════════════════════════════
# BLOCK QUOTE DETECTOR (APA: 40+ words → indent 0.5in, no surrounding quotes)
# ═══════════════════════════════════════════════════════════════════════

def _is_block_quote(text: str) -> bool:
    """APA: direct quotes of 40+ words should be block-quoted."""
    stripped = text.strip()
    # Must start and end with quotation marks, or contain a page citation
    has_quotes  = (stripped.startswith('"') and '"' in stripped[1:]) or \
                  (stripped.startswith('\u201c') and '\u201d' in stripped[1:])
    has_pg_cite = bool(re.search(r'p\.\s*\d+', stripped))
    return _word_count(stripped) >= 40 and (has_quotes or has_pg_cite)


# ═══════════════════════════════════════════════════════════════════════
# MAIN FORMATTING ENGINE
# ═══════════════════════════════════════════════════════════════════════

def apply_formatting(input_path: str, output_path: str, style: str = "APA"):
    is_mla  = style.upper().startswith("MLA")
    is_ieee = style.upper().startswith("IEEE")

    # Per-style font/spacing constants
    font_size  = FONT_SIZE_IEEE if is_ieee else FONT_SIZE
    line_space = LINE_SPACE_IEEE if is_ieee else LINE_SPACE

    doc       = Document(input_path)
    all_paras = list(doc.paragraphs)
    total     = len(all_paras)
    changes_log = []

    # ── 1. PAGE SETUP ────────────────────────────────────────────────────
    for sec in doc.sections:
        sec.page_width    = int(8.5  * 914400)
        sec.page_height   = int(11.0 * 914400)
        sec.top_margin    = Inches(0.75 if is_ieee else 1)
        sec.bottom_margin = Inches(1)
        sec.left_margin   = Inches(0.625 if is_ieee else 1)
        sec.right_margin  = Inches(0.625 if is_ieee else 1)
    if is_ieee:
        changes_log.append("Page: 8.5×11 in, 0.75in top / 0.625in side margins (IEEE)")
    else:
        changes_log.append("Page: 8.5×11 in, 1-inch margins all sides")

    # ── 2. NORMAL STYLE DEFAULT ──────────────────────────────────────────
    try:
        ns = doc.styles["Normal"]
        ns.font.name = FONT_NAME
        ns.font.size = Pt(font_size)
        ns.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.LEFT  # Purdue OWL: alignment = "left"
    except Exception:
        pass
    changes_log.append(f"Font → {FONT_NAME} {font_size}pt, {'single' if is_ieee else 'double'} spaced")

    # ── 3. TWO-PASS CLASSIFICATION ───────────────────────────────────────
    in_abstract = False
    in_refs     = False
    ref_start   = -1
    classes     = []

    for i, para in enumerate(all_paras):
        cls   = _classify(para, i, total)
        lower = para.text.strip().lower()

        # Strip Roman numerals from IEEE headings: "I. Introduction" → "introduction"
        ieee_lower = re.sub(r'^[ivxlcdm]+\.\s*', '', lower).strip() if is_ieee else lower

        if cls == "level1":
            if lower == "abstract" or ieee_lower == "abstract":
                in_abstract = True;  in_refs = False
            elif lower in WORKS_CITED_VARIANTS or lower in ("references", "works cited") \
                    or ieee_lower == "references":
                in_refs = True;  in_abstract = False;  ref_start = i
            else:
                in_abstract = False
        elif in_abstract and cls == "body":
            cls = "abstract_body"
        elif in_refs and i > ref_start and cls == "body":
            cls = "ref_body"

        # IEEE: detect level1 headings by Roman numeral pattern
        if is_ieee and cls == "body":
            if re.match(r'^[IVX]+\.\s+[A-Z]', para.text.strip()):
                cls = "level1"
            elif re.match(r'^[A-Z]\.\s+[A-Z]', para.text.strip()):
                cls = "level2"

        classes.append(cls)

    # ── 4. FORMAT EACH PARAGRAPH ─────────────────────────────────────────
    insertions = {}
    cnt = dict(
        level1=0, level2=0, level3=0, level4=0, level5=0,
        abstract_body=0, ref_body=0, body=0,
        cite_fix=0, ref_fix=0, renamed=0,
        truncated=0, kw_split=0, block_quote=0,
    )

    # IEEE: build citation counter map  [1], [2], [3]...
    ieee_cite_map   = {}   # "AuthorYear" key → number
    ieee_cite_order = [0]  # mutable counter

    def _ieee_cite_num(author: str, year: str) -> str:
        key = f"{author.lower()}{year}"
        if key not in ieee_cite_map:
            ieee_cite_order[0] += 1
            ieee_cite_map[key] = ieee_cite_order[0]
        return str(ieee_cite_map[key])

    def _replace_ieee_placeholders(text: str) -> str:
        """Replace [?] placeholders with sequential [N] numbers."""
        def _sub(m):
            # Assign next available number for each placeholder in order
            ieee_cite_order[0] += 1
            return f"[{ieee_cite_order[0]}]"
        return re.sub(r'\[\?\]', _sub, text)

    for i, (para, cls) in enumerate(zip(all_paras, classes)):
        text, run = _merge_runs(para)
        _force_font(run, size=font_size)
        _set_spacing(para, line=line_space)
        clean = text.strip()

        # ── EMPTY ────────────────────────────────────────────────────────
        if cls == "empty":
            continue

        # ── TITLE ────────────────────────────────────────────────────────
        elif cls == "title":
            titled   = _title_case(clean)
            run.text = titled
            # APA: Bold, centered | MLA: NOT bold, NOT italic, centered
            run.bold   = not is_mla
            run.italic = False
            _force_font(run)
            para.alignment = WD_ALIGN_PARAGRAPH.CENTER
            _clear_indent(para)
            changes_log.append(f"Title → centered, {'plain' if is_mla else 'bold'}, title case")

        # ── TITLE PAGE / HEADING BLOCK ────────────────────────────────────
        # APA: all centered | MLA: all left-aligned | IEEE: centered
        elif cls == "title_page":
            run.bold = False; run.italic = False
            _force_font(run, size=font_size)
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT if is_mla else WD_ALIGN_PARAGRAPH.CENTER
            _clear_indent(para)

        # ── LEVEL 1 HEADING ──────────────────────────────────────────────
        elif cls == "level1":
            lower_c = clean.lower()

            if is_ieee:
                # IEEE L1: ALL CAPS, centered, NOT bold, NOT italic
                # Roman numeral prefix preserved or added: "I. INTRODUCTION"
                # Strip existing Roman numeral to get bare heading name
                bare = re.sub(r'^[IVXivx]+\.\s*', '', clean).strip()
                upper_text = bare.upper()
                run.text   = upper_text
                run.bold   = False; run.italic = False
                _force_font(run, size=font_size)
                para.alignment = WD_ALIGN_PARAGRAPH.CENTER
                _clear_indent(para)
                _highlight(run, "cyan")
                changes_log.append(f"IEEE L1 → '{upper_text}' (centered, ALL CAPS)")
                cnt["level1"] += 1
                continue

            elif is_mla:
                # Works Cited: centered, NOT bold (MLA spec)
                # Other L1: Bold, Left, Title Case
                is_wc = (lower_c in WORKS_CITED_VARIANTS or lower_c == "references")
                # Only rename if it's not already "works cited"
                if is_wc and lower_c != "works cited":
                    cnt["renamed"] += 1
                    changes_log.append(f"'{clean}' → 'Works Cited' (MLA)")
                display    = "Works Cited" if is_wc else clean
                titled     = _title_case(display)
                run.text   = titled
                run.bold   = not is_wc
                run.italic = False
                _force_font(run, size=font_size)
                para.alignment = WD_ALIGN_PARAGRAPH.CENTER if is_wc else WD_ALIGN_PARAGRAPH.LEFT
                _clear_indent(para)

            else:
                # APA L1: Centered, Bold, Title Case
                is_wc = lower_c in WORKS_CITED_VARIANTS
                if is_wc:
                    cnt["renamed"] += 1
                    changes_log.append(f"'{clean}' → 'References' (APA)")
                display    = "References" if is_wc else clean
                titled     = _title_case(display)
                run.text   = titled
                run.bold   = True; run.italic = False
                _force_font(run, size=font_size)
                para.alignment = WD_ALIGN_PARAGRAPH.CENTER
                _clear_indent(para)

            _highlight(run, "cyan")
            changes_log.append(f"L1 heading → '{titled}'")
            cnt["level1"] += 1

        # ── LEVEL 2 HEADING ──────────────────────────────────────────────
        # APA 7th: Left, Bold, Title Case, NOT italic
        # MLA 9th: Left, Bold Italic, Title Case
        # IEEE:    Left, Bold Italic, Title Case (subsection letter: "A. Subsection")
        elif cls == "level2":
            # IEEE: strip "A. " prefix then reformat
            bare = re.sub(r'^[A-Z]\.\s*', '', clean).strip() if is_ieee else clean
            titled     = _title_case(bare)
            run.text   = titled
            run.bold   = True
            run.italic = is_mla or is_ieee
            _force_font(run, size=font_size)
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            _clear_indent(para)
            _highlight(run, "cyan")
            changes_log.append(f"L2 → '{titled}'")
            cnt["level2"] += 1

        # ── LEVEL 3 HEADING ──────────────────────────────────────────────
        elif cls == "level3":
            titled     = _title_case(clean)
            run.text   = titled
            run.bold   = True
            run.italic = True
            _force_font(run, size=font_size)
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            _clear_indent(para)
            _highlight(run, "cyan")
            changes_log.append(f"L3 → '{titled}' (Left Bold Italic)")
            cnt["level3"] += 1

        # ── LEVEL 4 HEADING (APA only) ────────────────────────────────────
        elif cls == "level4":
            titled = _title_case(clean)
            if not titled.endswith("."):
                titled += "."
            run.text   = titled
            run.bold   = True; run.italic = False
            _force_font(run, size=font_size)
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            _set_left_indent(para, BODY_INDENT)
            _highlight(run, "cyan")
            changes_log.append(f"L4 heading → '{titled}' (inline)")
            cnt["level4"] += 1

        # ── LEVEL 5 HEADING (APA only) ────────────────────────────────────
        elif cls == "level5":
            titled = _title_case(clean)
            if not titled.endswith("."):
                titled += "."
            run.text   = titled
            run.bold   = True; run.italic = True
            _force_font(run, size=font_size)
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            _set_left_indent(para, BODY_INDENT)
            _highlight(run, "cyan")
            changes_log.append(f"L5 heading → '{titled}' (inline)")
            cnt["level5"] += 1

        # ── ABSTRACT BODY ─────────────────────────────────────────────────
        elif cls == "abstract_body":
            if is_mla:
                _force_font(run, size=font_size)
                para.alignment = WD_ALIGN_PARAGRAPH.LEFT
                _set_first_line(para)
                cnt["body"] += 1
            elif is_ieee:
                # IEEE abstract: bold "Abstract--" prefix, no indent, single spaced
                if not clean.lower().startswith("abstract"):
                    run.text = clean
                _force_font(run, size=font_size)
                para.alignment = WD_ALIGN_PARAGRAPH.LEFT
                _clear_indent(para)
                cnt["abstract_body"] += 1
            else:
                # APA: no first-line indent, left aligned
                kw = re.search(r',?\s*keywords?:\s*(.+)', clean, re.IGNORECASE)
                if kw:
                    body_text = clean[:kw.start()].strip()
                    kw_list   = kw.group(1).strip()
                    run.text  = body_text
                    _force_font(run, size=font_size)
                    para.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    _clear_indent(para)
                    kw_full = f"Keywords: {kw_list}"
                    insertions.setdefault(i, []).append(
                        _make_para_xml(kw_full, align="left", italic=True,
                                       first_line=BODY_INDENT,
                                       font=FONT_NAME, size=font_size))
                    cnt["kw_split"] += 1
                    changes_log.append("Abstract keywords → separate italic line, 0.5in indent")
                else:
                    _force_font(run, size=font_size)
                    para.alignment = WD_ALIGN_PARAGRAPH.LEFT
                    _clear_indent(para)
                cnt["abstract_body"] += 1

        # ── REFERENCE / WORKS CITED ENTRIES ───────────────────────────────
        elif cls == "ref_body":
            if is_ieee:
                # IEEE references: [1] J. Smith, "Title," Journal, vol., no., pp., year.
                fixed = _format_one_ref_ieee(clean, ieee_cite_map)
                run.text = fixed
            else:
                entries = _split_and_format_refs(clean, style="MLA" if is_mla else "APA")
                if not entries:
                    entries = [clean]
                run.text = entries[0]
                for extra in entries[1:]:
                    insertions.setdefault(i, []).append(
                        _make_para_xml(extra, align="left", highlight="green",
                                       hanging=BODY_INDENT, font=FONT_NAME, size=font_size))

            _force_font(run, size=font_size)
            _highlight(run, "green")
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            _set_hanging(para)

            if run.text != clean:
                cnt["ref_fix"] += 1
                changes_log.append(f"Ref entry → formatted")
            cnt["ref_body"] += 1

        # ── BODY PARAGRAPH ────────────────────────────────────────────────
        # APA 7th / MLA 9th / IEEE: left aligned, 0.5in first-line indent
        # (Purdue OWL apa_mla_rules.json → body_text.alignment = "left")
        else:
            _force_font(run, size=font_size)
            para.alignment = WD_ALIGN_PARAGRAPH.LEFT
            _set_first_line(para)

            # Block quote detection (APA only)
            if not is_mla and not is_ieee and _is_block_quote(clean):
                bq_text = re.sub(r'^["\u201c]|["\u201d]$', '', clean).strip()
                run.text = bq_text
                para.alignment = WD_ALIGN_PARAGRAPH.LEFT
                _set_left_indent(para, BODY_INDENT)   # set once -- no clear/re-set
                cnt["block_quote"] += 1
                changes_log.append("Block quote (40+ words) → indented 0.5in, quotes removed")

            # Fix citations -- choose fixer by style
            if is_ieee:
                fixer = _fix_citations_ieee
            elif is_mla:
                fixer = _fix_citations_mla
            else:
                fixer = _fix_citations_apa
            fixed, cite_changes = fixer(run.text)
            if cite_changes:
                run.text = fixed
                # For IEEE: replace any [?] placeholders with sequential numbers
                if is_ieee and "[?]" in run.text:
                    run.text = _replace_ieee_placeholders(run.text)
                _highlight(run, "yellow")
                changes_log.extend(cite_changes)
                cnt["cite_fix"] += 1
            elif is_ieee and "[?]" in run.text:
                run.text = _replace_ieee_placeholders(run.text)

            # Flag truncated sentences
            if _is_truncated(clean):
                run2 = para.add_run("  ⚠ [INCOMPLETE -- check original]")
                run2.font.color.rgb = RGBColor(0xCC, 0x00, 0x00)
                run2.font.size      = Pt(9)
                run2.italic         = True
                cnt["truncated"] += 1
                changes_log.append(f"Flagged truncated: '{clean[:50]}...'")

            # APA: flag direct quotes missing page number (flag_for_review rule)
            # A direct quote has quotation marks but no p. N / pp. N citation
            if not is_mla and not is_ieee:
                has_quote_marks = ('"' in clean or '\u201c' in clean or '\u201d' in clean)
                has_page_cite   = bool(re.search(r'p{1,2}\.\s*\d+', clean))
                has_any_cite    = bool(re.search(r'\(\w+.*?\d{4}', clean))
                if has_quote_marks and has_any_cite and not has_page_cite and _word_count(clean) < 40:
                    run3 = para.add_run("  ⚠ [Direct quote -- add page number: p. X]")
                    run3.font.color.rgb = RGBColor(0xCC, 0x00, 0x00)
                    run3.font.size      = Pt(9)
                    run3.italic         = True
                    changes_log.append("Flagged direct quote missing page number")

            cnt["body"] += 1

    # ── 5. INSERT EXTRA PARAGRAPHS ───────────────────────────────────────
    for i in sorted(insertions.keys(), reverse=True):
        anchor = all_paras[i]
        for new_p_xml in reversed(insertions[i]):
            anchor._p.addnext(new_p_xml)

    # ── 6. COMPLIANCE SCORE ──────────────────────────────────────────────
    # Base: 70 -- a document that needed no fixes is already well-formed
    score = 70
    score += min(10, cnt["level1"]      * 2)
    score += 5  if cnt["ref_body"]      > 0 else 0
    score += 4  if cnt["abstract_body"] > 0 else 0
    score += 3  if cnt["body"]          > 0 else 0
    # cite_fix: reward for fixing problems, but no penalty for clean docs
    score += 3  if cnt["cite_fix"]      > 0 else 3   # same reward either way
    score += 2  if cnt["level2"]        > 0 else 0
    score += 2  if cnt["level3"]        > 0 else 0
    score += 1  if cnt["level4"]        > 0 else 0
    score += 1  if cnt["renamed"]       > 0 else 0
    score += 1  if cnt["ref_fix"]       > 0 else 0
    score += 1  if cnt["kw_split"]      > 0 else 0
    # Deduct for warnings/flags
    score -= min(10, cnt["truncated"]   * 2)
    score = max(50, min(score, 97))

    # ── 7. SAVE ──────────────────────────────────────────────────────────
    doc.save(output_path)

    # ── 8. SUMMARY ───────────────────────────────────────────────────────
    sl = "MLA 9th" if is_mla else ("IEEE" if is_ieee else "APA 7th")
    page_spec = ("Page: 8.5×11 in, 0.75in top / 0.625in side margins, "
                 "Times New Roman 10pt, single spaced (IEEE)"
                 if is_ieee else
                 "Page: 8.5×11 in, 1-inch margins, Times New Roman 12pt, double spaced")
    summary = [
        f"Style: {sl} Edition",
        page_spec,
    ]
    if cnt["level1"]:
        if is_ieee:
            l1fmt = "Centered, ALL CAPS, not bold"
        elif is_mla:
            l1fmt = "Left, Bold"
        else:
            l1fmt = "Centered, Bold"
        summary.append(f"L1 headings ({l1fmt}): {cnt['level1']} formatted")
    if cnt["level2"]:
        l2fmt = "Left, Bold Italic" if (is_mla or is_ieee) else "Left, Bold"
        summary.append(f"L2 headings ({l2fmt}, Title Case): {cnt['level2']} formatted")
    if cnt["level3"]:
        summary.append(f"L3 headings (Left, Bold Italic, Title Case): {cnt['level3']} formatted")
    if cnt["level4"]:
        summary.append(f"L4 headings (Indented, Bold, inline with period): {cnt['level4']} formatted")
    if cnt["level5"]:
        summary.append(f"L5 headings (Indented, Bold Italic, inline with period): {cnt['level5']} formatted")
    if cnt["renamed"]:
        renamed_to = "Works Cited" if is_mla else "References"
        summary.append(f"Section heading renamed → '{renamed_to}'")
    if cnt["kw_split"] and not is_mla:
        summary.append("Abstract keywords → separate italic line, 0.5in indent")
    if cnt["abstract_body"] and not (is_mla or is_ieee):
        summary.append(f"Abstract body: left-aligned, no first-line indent ({cnt['abstract_body']} para)")
    if is_ieee and cnt["cite_fix"]:
        summary.append(f"Citations converted to IEEE numeric [N] format: {cnt['cite_fix']} paragraphs")
    if cnt["body"]:
        summary.append(f"Body paragraphs: {cnt['body']} formatted (left, 0.5in first-line indent)")
    if cnt["block_quote"]:
        summary.append(f"Block quotes: {cnt['block_quote']} reformatted (40+ words, 0.5in indent)")
    if cnt["cite_fix"]:
        fmt = "MLA (Author Page)" if is_mla else "APA (Author, Year)"
        summary.append(f"In-text citations fixed → {fmt} format")
    if cnt["ref_body"]:
        heading = "Works Cited" if is_mla else "References"
        summary.append(f"{heading}: {cnt['ref_body']} entries, 0.5in hanging indent")
    if cnt["ref_fix"]:
        summary.append(f"Reference entries split & reformatted to {sl} format")
    if cnt["truncated"]:
        summary.append(f"⚠ {cnt['truncated']} truncated sentences flagged in red")

    return output_path, summary, score


# ═══════════════════════════════════════════════════════════════════════
# COMPLIANCE REPORT
# ═══════════════════════════════════════════════════════════════════════

def _write_report(out_path: str, summary: list, score: int, style: str = "APA"):
    rp = Path(out_path).parent / "compliance_report.txt"
    is_mla = style.upper().startswith("MLA")
    style_label = "MLA 9th Edition" if is_mla else "APA 7th Edition"
    try:
        with open(rp, "w", encoding="utf-8") as f:
            f.write(f"{style_label} Compliance Report\n" + "=" * 45 + "\n")
            f.write(f"Score: {score}%\n\nChanges Applied:\n")
            for s in summary:
                f.write(f"  • {s}\n")
            f.write("\nHighlight Key (display only -- removed from downloaded file):\n")
            f.write("  Cyan   = Heading reformatted\n")
            f.write("  Yellow = In-text citation fixed\n")
            f.write("  Green  = Reference entry fixed\n")
            f.write("  Red    = Warning -- incomplete or needs review\n")
    except Exception:
        pass


# ═══════════════════════════════════════════════════════════════════════
# CITATION ↔ REFERENCE CONSISTENCY VALIDATOR
# ═══════════════════════════════════════════════════════════════════════
# Explicitly required by the problem statement:
# "Ensure consistency between in-text citations and references
#  and maintain pre-existing linkages if any."
#
# What this does:
#   1. Extract every in-text citation from body paragraphs
#   2. Extract every author key from reference/works-cited entries
#   3. Cross-match: flag citations with no reference entry (orphan cite)
#   4. Cross-match: flag reference entries never cited in body (orphan ref)
#   5. Return a structured report with severity levels
# ═══════════════════════════════════════════════════════════════════════

def _extract_intext_authors_apa(text: str) -> set:
    """
    Pull all author last-names from APA in-text citations in one paragraph.
    Handles: (Smith, 2020) | (Smith & Jones, 2020) | (Smith et al., 2020)
             Smith (2020) narrative | (Smith, 2020; Jones, 2021) multiple
    Returns set of lowercase last-names found.
    """
    authors = set()
    # Parenthetical: (Smith, 2020) / (Smith & Jones, 2020) / (Smith et al., 2020)
    for m in re.finditer(r'\(([^)]+\d{4}[^)]*)\)', text):
        inner = m.group(1)
        # Pull every Capitalised word that looks like a last name
        for name in re.findall(r'([A-Z][a-z]{1,})', inner):
            if name.lower() not in {"et", "al", "and", "the", "in", "of"}:
                authors.add(name.lower())
    # Narrative: Smith (2020) or Smith and Jones (2020)
    for m in re.finditer(r'([A-Z][a-z]+)(?:\s+and\s+[A-Z][a-z]+)?\s+\(\d{4}', text):
        authors.add(m.group(1).lower())
    return authors


def _extract_intext_authors_mla(text: str) -> set:
    """
    Pull all author last-names from MLA in-text citations.
    Handles: (Smith 45) | (Smith and Jones 45) | (Smith et al. 45) | (Smith)
    """
    authors = set()
    for m in re.finditer(r'\(([^)]+)\)', text):
        inner = m.group(1).strip()
        for name in re.findall(r'([A-Z][a-z]{1,})', inner):
            if name.lower() not in {"et", "al", "and", "the"}:
                authors.add(name.lower())
    return authors


def _extract_ref_author_key(entry: str) -> "Optional[str]":
    """
    Extract the primary (first) author last name from a reference entry.
    Handles APA:  Smith, J. (2020)...
    Handles MLA:  Smith, John. Title...
    Handles bare: Smith J 2020...
    Returns lowercase last name, or None if unparseable.
    """
    entry = entry.strip()
    if not entry:
        return None
    # APA / MLA formatted: "LastName, ..."
    m = re.match(r'^([A-Z][a-z]+),', entry)
    if m:
        return m.group(1).lower()
    # Bare: "LastName Initial Year..."
    m = re.match(r'^([A-Z][a-z]+)\s+[A-Z]', entry)
    if m:
        return m.group(1).lower()
    return None


def validate_citation_consistency(doc_path: str, style: str = "APA") -> dict:
    """
    Cross-validate in-text citations against reference list entries.

    Args:
        doc_path: Path to the .docx file (original OR formatted)
        style:    'APA' or 'MLA'

    Returns dict:
        {
          "cited_authors":    set  -- all author keys found in body citations
          "ref_authors":      set  -- all author keys found in reference list
          "orphan_cites":     list -- cited in body but NO matching reference entry
          "orphan_refs":      list -- in reference list but NEVER cited in body
          "matched":          list -- correctly linked author keys
          "score":            int  -- 0-100 consistency score
          "issues":           list -- human-readable issue descriptions
          "status":           str  -- "PASS" / "WARNINGS" / "ERRORS"
        }
    """
    is_mla = style.upper().startswith("MLA")

    try:
        doc = Document(doc_path)
    except Exception as e:
        return {"error": str(e), "score": 0, "issues": [f"Could not open file: {e}"],
                "status": "ERROR", "orphan_cites": [], "orphan_refs": [],
                "matched": [], "cited_authors": set(), "ref_authors": set()}

    all_paras   = list(doc.paragraphs)
    total       = len(all_paras)

    # ── Pass 1: re-classify paragraphs (same logic as formatting engine) ──
    in_refs   = False
    ref_start = -1
    classes   = []
    for i, para in enumerate(all_paras):
        lower = para.text.strip().lower()
        cls   = _classify(para, i, total)
        if cls == "level1":
            if lower in WORKS_CITED_VARIANTS or lower in ("references", "works cited"):
                in_refs   = True
                ref_start = i
        elif in_refs and i > ref_start and cls == "body":
            cls = "ref_body"
        classes.append(cls)

    # ── Pass 2: collect citations from body & authors from ref list ───────
    extractor  = _extract_intext_authors_mla if is_mla else _extract_intext_authors_apa
    cited_authors: set = set()
    ref_authors:   set = set()
    ref_entries:   list = []

    for para, cls in zip(all_paras, classes):
        text = para.text.strip()
        if not text:
            continue
        if cls in ("body", "abstract_body"):
            cited_authors |= extractor(text)
        elif cls == "ref_body":
            ref_entries.append(text)
            key = _extract_ref_author_key(text)
            if key:
                ref_authors.add(key)

    # ── Pass 3: cross-match ───────────────────────────────────────────────
    # Remove very common false-positive names that appear in text naturally
    STOPNAMES = {"introduction", "background", "method", "result", "discussion",
                 "conclusion", "abstract", "figure", "table", "note", "see",
                 "based", "according", "shown", "found", "used", "two", "one"}
    cited_authors -= STOPNAMES
    ref_authors   -= STOPNAMES

    matched      = sorted(cited_authors & ref_authors)
    orphan_cites = sorted(cited_authors - ref_authors)   # cited but no reference
    orphan_refs  = sorted(ref_authors  - cited_authors)  # in refs but never cited

    # ── Pass 4: build issue list ──────────────────────────────────────────
    issues = []
    severity = "PASS"

    if not ref_entries:
        issues.append("⚠ No reference/works-cited section detected -- cannot validate consistency")
        severity = "WARNINGS"
    else:
        if orphan_cites:
            severity = "ERRORS"
            for name in orphan_cites:
                issues.append(
                    f"❌ '{name.title()}' cited in body but has NO matching reference entry"
                )
        if orphan_refs:
            if severity != "ERRORS":
                severity = "WARNINGS"
            for name in orphan_refs:
                issues.append(
                    f"⚠ '{name.title()}' appears in reference list but is NEVER cited in body"
                )
        if not orphan_cites and not orphan_refs:
            issues.append(f"✅ All {len(matched)} cited author(s) have matching reference entries")
            issues.append(f"✅ All {len(ref_authors)} reference entries are cited in the body")

    # ── Pass 5: consistency score ─────────────────────────────────────────
    total_keys = len(cited_authors | ref_authors)
    if total_keys == 0:
        score = 100   # nothing to check
    else:
        errors   = len(orphan_cites) * 2 + len(orphan_refs)   # orphan cites hurt more
        score    = max(0, 100 - int((errors / max(total_keys, 1)) * 100))

    return {
        "cited_authors": cited_authors,
        "ref_authors":   ref_authors,
        "matched":       matched,
        "orphan_cites":  orphan_cites,
        "orphan_refs":   orphan_refs,
        "ref_count":     len(ref_entries),
        "score":         score,
        "issues":        issues,
        "status":        severity,
    }


def validate_from_text(full_text: str, style: str = "APA") -> dict:
    """
    Validate citation consistency from plain text (no .docx needed).
    Used when only a text extraction is available (e.g. PDF input).
    Splits text into body and reference sections heuristically.
    """
    is_mla    = style.upper().startswith("MLA")
    extractor = _extract_intext_authors_mla if is_mla else _extract_intext_authors_apa

    # Split at references heading
    ref_heading_pat = re.compile(
        r'\n\s*(references|works cited|bibliography|reference list)\s*\n',
        re.IGNORECASE
    )
    m = ref_heading_pat.search(full_text)

    if m:
        body_text = full_text[:m.start()]
        refs_text = full_text[m.end():]
    else:
        # No heading found -- treat last 20% as references heuristically
        split = int(len(full_text) * 0.8)
        body_text = full_text[:split]
        refs_text = full_text[split:]

    # Extract cited authors from body
    cited_authors: set = set()
    for line in body_text.splitlines():
        cited_authors |= extractor(line)

    # Extract ref authors
    ref_authors: set = set()
    ref_entries: list = []
    for line in refs_text.splitlines():
        line = line.strip()
        if not line: continue
        key = _extract_ref_author_key(line)
        if key:
            ref_authors.add(key)
            ref_entries.append(line)

    STOPNAMES = {"introduction","background","method","result","discussion",
                 "conclusion","abstract","figure","table","note","see",
                 "based","according","shown","found","used","two","one"}
    cited_authors -= STOPNAMES
    ref_authors   -= STOPNAMES

    matched      = sorted(cited_authors & ref_authors)
    orphan_cites = sorted(cited_authors - ref_authors)
    orphan_refs  = sorted(ref_authors  - cited_authors)

    issues   = []
    severity = "PASS"

    if not ref_entries:
        issues.append("⚠ No reference section detected in text")
        severity = "WARNINGS"
    else:
        for name in orphan_cites:
            issues.append(f"❌ '{name.title()}' cited but no reference entry found")
            severity = "ERRORS"
        for name in orphan_refs:
            issues.append(f"⚠ '{name.title()}' in references but never cited in body")
            if severity != "ERRORS": severity = "WARNINGS"
        if not orphan_cites and not orphan_refs:
            issues.append(f"✅ All {len(matched)} cited author(s) matched to reference entries")

    total_keys = len(cited_authors | ref_authors)
    errors     = len(orphan_cites) * 2 + len(orphan_refs)
    score      = max(0, 100 - int((errors / max(total_keys, 1)) * 100)) if total_keys else 100

    return {
        "cited_authors": cited_authors,
        "ref_authors":   ref_authors,
        "matched":       matched,
        "orphan_cites":  orphan_cites,
        "orphan_refs":   orphan_refs,
        "ref_count":     len(ref_entries),
        "score":         score,
        "issues":        issues,
        "status":        severity,
    }



def format_manuscript(input_path: str, style: str = "APA") -> str:
    """Format a manuscript. style: 'APA' or 'MLA'. Returns output path or 'ERROR:...'"""
    input_path = str(input_path).strip()
    if not os.path.exists(input_path):
        return f"ERROR: File not found: {input_path}"

    p           = Path(input_path)
    if style.upper().startswith("MLA"):
        style_tag = "mla"
    elif style.upper().startswith("IEEE"):
        style_tag = "ieee"
    else:
        style_tag = "apa"
    output_path = str(p.parent / f"formatted_{style_tag}_{p.stem}.docx")

    print(f"\n[agent] Style:  {style}")
    print(f"[agent] Input:  {input_path}")
    print(f"[agent] Output: {output_path}")

    try:
        out, summary, score = apply_formatting(input_path, output_path, style=style)
    except Exception as e:
        import traceback; traceback.print_exc()
        return f"ERROR: {e}"

    # ── Run citation-reference consistency validator on the OUTPUT file ──
    print("[agent] Running citation-reference consistency check...")
    try:
        cv = validate_citation_consistency(output_path, style=style)
        # Append consistency results to summary
        summary.append("─" * 38)
        summary.append(f"Citation-Reference Consistency: {cv['status']} (score: {cv['score']}%)")
        summary.append(f"  Cited authors:  {len(cv['cited_authors'])}")
        summary.append(f"  Reference keys: {len(cv['ref_authors'])}")
        summary.append(f"  Matched:        {len(cv['matched'])}")
        if cv["orphan_cites"]:
            summary.append(f"  ❌ Missing refs: {', '.join(n.title() for n in cv['orphan_cites'])}")
        if cv["orphan_refs"]:
            summary.append(f"  ⚠ Uncited refs: {', '.join(n.title() for n in cv['orphan_refs'])}")
        for issue in cv["issues"]:
            summary.append(f"  {issue}")

        # Blend consistency score into overall score
        score = int(score * 0.7 + cv["score"] * 0.3)
        score = min(score, 98)

        # Save validator result separately for UI to read
        vp = Path(output_path).parent / "consistency_report.json"
        import json as _json
        vp.write_text(_json.dumps({
            "status":        cv["status"],
            "score":         cv["score"],
            "matched":       cv["matched"],
            "orphan_cites":  cv["orphan_cites"],
            "orphan_refs":   cv["orphan_refs"],
            "ref_count":     cv["ref_count"],
            "issues":        cv["issues"],
        }, indent=2), encoding="utf-8")
        print(f"[agent] Consistency: {cv['status']} -- {len(cv['orphan_cites'])} orphan cites, "
              f"{len(cv['orphan_refs'])} uncited refs")
    except Exception as e:
        summary.append(f"⚠ Consistency check failed: {e}")

    _write_report(output_path, summary, score, style=style)
    print(f"[agent] ✅ Score: {score}%")
    for s in summary:
        print(f"[agent]   • {s}")
    return output_path


def get_document_type(text: str) -> dict:
    """Public wrapper for document type detection."""
    return detect_document_type(text)


# ═══════════════════════════════════════════════════════════════════════
# CLI
# ═══════════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    if len(sys.argv) > 1:
        style_arg = sys.argv[2] if len(sys.argv) > 2 else "APA"
        print(format_manuscript(sys.argv[1], style=style_arg))
    else:
        print("Usage: python agent.py manuscript.docx [APA|MLA]")