"""Apply April-2026 updates to Omer_Dengiz_Resume.docx in place, preserving formatting.

Changes:
  1. Append `omerdengiz.com` to the contact line as a styled hyperlink matching the other
     contact items (email, LinkedIn, GitHub).
  2. Extend Networking & Security skills line with new items inline (no "new this semester"
     framing). Keeps the bold label in run[0], content in run[1], so only the label stays bold.
  3. Drop the standalone "CERTIFICATIONS & LANGUAGES" section header to keep the resume on
     a single page.
"""
from copy import deepcopy
from pathlib import Path

from docx import Document
from docx.oxml import OxmlElement
from docx.oxml.ns import qn
from docx.opc.constants import RELATIONSHIP_TYPE as RT

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "Omer_Dengiz_Resume.docx"
OUT = ROOT / "Omer_Dengiz_Resume.docx"


def update_skill_line(para, label: str, content: str) -> None:
    """Update a 'Label: content' skill paragraph, preserving run[0]'s bold label style
    and run[1]'s non-bold content style. Removes any extra runs beyond run[1]."""
    runs = para.runs
    if len(runs) >= 2:
        runs[0].text = label
        runs[1].text = content
        # Strip anything past run[1]
        for r in runs[2:]:
            r._element.getparent().remove(r._element)
    elif len(runs) == 1:
        runs[0].text = label + content
    else:
        para.add_run(label + content)


def add_hyperlink(paragraph, url: str, text: str) -> None:
    """Append a hyperlink to `paragraph` styled like the existing contact hyperlinks."""
    part = paragraph.part
    r_id = part.relate_to(url, RT.HYPERLINK, is_external=True)

    hyperlink = OxmlElement("w:hyperlink")
    hyperlink.set(qn("r:id"), r_id)
    hyperlink.set(qn("w:history"), "1")

    new_r = OxmlElement("w:r")
    rPr = OxmlElement("w:rPr")

    rFonts = OxmlElement("w:rFonts")
    for attr in ("w:ascii", "w:cs", "w:eastAsia", "w:hAnsi"):
        rFonts.set(qn(attr), "Arial")
    rPr.append(rFonts)

    color = OxmlElement("w:color")
    color.set(qn("w:val"), "0563C1")
    rPr.append(color)

    sz = OxmlElement("w:sz")
    sz.set(qn("w:val"), "20")
    rPr.append(sz)

    szCs = OxmlElement("w:szCs")
    szCs.set(qn("w:val"), "20")
    rPr.append(szCs)

    u = OxmlElement("w:u")
    u.set(qn("w:val"), "single")
    rPr.append(u)

    new_r.append(rPr)

    t = OxmlElement("w:t")
    t.text = text
    t.set(qn("xml:space"), "preserve")
    new_r.append(t)

    hyperlink.append(new_r)
    paragraph._p.append(hyperlink)


def append_separator_run(paragraph, text: str = "  \u2022  ") -> None:
    """Append a plain, non-hyperlink run (for the ' • ' separator between contact items)."""
    new_r = OxmlElement("w:r")
    rPr = OxmlElement("w:rPr")

    rFonts = OxmlElement("w:rFonts")
    for attr in ("w:ascii", "w:cs", "w:eastAsia", "w:hAnsi"):
        rFonts.set(qn(attr), "Arial")
    rPr.append(rFonts)

    sz = OxmlElement("w:sz")
    sz.set(qn("w:val"), "20")
    rPr.append(sz)

    szCs = OxmlElement("w:szCs")
    szCs.set(qn("w:val"), "20")
    rPr.append(szCs)

    new_r.append(rPr)

    t = OxmlElement("w:t")
    t.text = text
    t.set(qn("xml:space"), "preserve")
    new_r.append(t)

    paragraph._p.append(new_r)


doc = Document(str(SRC))
paragraphs = doc.paragraphs

# 1) Contact line: append " • omerdengiz.com" as a hyperlink.
contact = paragraphs[2]
if "omerdengiz.com" not in contact.text:
    append_separator_run(contact, "  \u2022  ")
    add_hyperlink(contact, "https://omerdengiz.com", "omerdengiz.com")

# 2) Networking & Security line: update content run only so only the label stays bold.
ns_idx = next(i for i, p in enumerate(paragraphs) if p.text.startswith("Networking & Security:"))
update_skill_line(
    paragraphs[ns_idx],
    label="Networking & Security: ",
    content=(
        "Cisco IOS, TCP/IP, OSPF, BGP, QoS, VLANs, DHCP, DNS, 802.11 a/b/g/n/ac, "
        "802.1X EAP-PEAP, ArubaOS, OpenVPN, site-to-site VPN, firewalls, Wireshark, iSCSI, "
        "PKI, TLS/SSH, IDS/IPS, CVSS"
    ),
)

# 3) Tighten summary sentence 2 and add Dean's Honour List to the GPA line.
summary_idx = next(
    (i for i, p in enumerate(paragraphs) if p.text.startswith("Computer Systems Technician \u2013 Networking graduate")),
    None,
)
if summary_idx is not None:
    summary_new = (
        "Computer Systems Technician \u2013 Networking graduate and AWS Certified Solutions "
        "Architect \u2013 Associate with hands-on experience in AWS cloud infrastructure, Linux and "
        "Windows administration, enterprise networking, and IT operations at Interac Corp. and "
        "Nioyatech LLC. Builds reliable hybrid environments with Terraform, Ansible, Docker, "
        "Kubernetes, and CI/CD pipelines, with a focus on clear documentation, structured "
        "troubleshooting, and cross-team collaboration."
    )
    # summary paragraph has a single non-bold run
    sp = paragraphs[summary_idx]
    if sp.runs:
        sp.runs[0].text = summary_new
        for r in sp.runs[1:]:
            r._element.getparent().remove(r._element)

gpa_idx = next(
    (i for i, p in enumerate(paragraphs) if p.text.strip().startswith("GPA:")),
    None,
)
if gpa_idx is not None and "Dean" not in paragraphs[gpa_idx].text:
    gp = paragraphs[gpa_idx]
    if gp.runs:
        gp.runs[0].text = "GPA: 3.75 / 4.0  \u2022  Dean's Honour List"

# 4) Drop the standalone "CERTIFICATIONS & LANGUAGES" header to keep the resume on one page.
cert_header_idx = next(
    (i for i, p in enumerate(paragraphs) if p.text.strip() == "CERTIFICATIONS & LANGUAGES"),
    None,
)
if cert_header_idx is not None:
    hdr = paragraphs[cert_header_idx]
    hdr._element.getparent().remove(hdr._element)

doc.save(str(OUT))
print(f"Saved {OUT}")
