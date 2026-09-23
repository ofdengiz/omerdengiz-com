"""Cross-surface consistency audit: resume PDF vs website vs GitHub profile.

Every check states what it expects and where. A finding is only reported when
the same *claim* is made differently on two surfaces — not when one surface
simply omits something the other mentions, which is normal (a resume skills
block is not an inventory of every technology in every project).
"""
import re, html, pathlib, sys
from pypdf import PdfReader

ROOT = pathlib.Path(__file__).resolve().parents[1]
GH   = pathlib.Path(r'C:\Algonquin\github-profile\README.md')

def norm(s): return ' '.join(s.split())
def detag(p): return norm(html.unescape(re.sub(r'<[^>]+>', ' ', p.read_text(encoding='utf-8'))))

pdf = norm(' '.join(p.extract_text() for p in PdfReader(ROOT/'Omer_Dengiz_Resume.pdf').pages))
pages = {p.relative_to(ROOT/'dist').as_posix(): detag(p) for p in (ROOT/'dist').rglob('*.html')}
site = ' '.join(pages.values())
home = pages.get('index.html', '')
gh   = norm(GH.read_text(encoding='utf-8')) if GH.exists() else ''
repo = norm((ROOT/'README.md').read_text(encoding='utf-8'))

findings = []
def check(cat, desc, ok, detail=''):
    if not ok: findings.append((cat, desc, detail))
    print(f"  {'ok ' if ok else 'XX '} [{cat}] {desc}" + (f"\n         -> {detail}" if not ok and detail else ''))

print("\n=== 1. KIMLIK / ILETISIM " + "="*44)
check('kimlik', 'telefon her yerde ayni', '(647) 446-9905' in pdf and '(647) 446-9905' in home)
check('kimlik', 'e-posta her yerde ayni', 'omerdengiz368@gmail.com' in pdf and 'omerdengiz368@gmail.com' in home)
check('kimlik', 'konum Kanata, ON', 'Kanata, ON' in pdf and 'Kanata' in home)
check('kimlik', 'pozisyon satiri sirasi ayni (Systems Administration once)',
      'Systems Administration | Cloud Infrastructure' in pdf and
      'Systems Administration' in home and
      home.find('Systems Administration') < home.find('Cloud Infrastructure') if 'Cloud Infrastructure' in home else True)

print("\n=== 2. KREDILER " + "="*53)
check('kredi', 'RCMP taramasi resume+site', 'RCMP' in pdf and 'RCMP' in site)
check('kredi', 'CCNA resume+site+github', 'CCNA' in pdf and 'CCNA' in site and 'CCNA' in gh)
check('kredi', 'AWS gecerlilik penceresi site+github', '2023' in pdf and '2023' in site and '2023' in gh)
check('kredi', 'site kosulsuz "AWS Certified" iddiasi yok (meta aciklama dahil)',
      'AWS Certified Solutions Architect. Cloud' not in home,
      'index.astro meta description hala kosulsuz iddia ediyor olabilir')

print("\n=== 3. EGITIM " + "="*55)
check('egitim', 'Graduated with Honours resume+site', 'Honours' in pdf and 'Honours' in site)
check('egitim', 'GPA 3.75 tutarli', '3.75' in pdf and '3.75' in site)
check('egitim', "gecersiz 'Dean's Honour List' kalintisi yok",
      "Dean" not in pdf and "Dean" not in site and "Dean" not in gh)
check('egitim', 'mezuniyet Apr 2026', 'Apr 2026' in pdf and 'Apr 2026' in site)

print("\n=== 4. DENEYIM " + "="*54)
for b in ['Improved reliability across 30+ Linux servers',
          'Automated provisioning for 3 multi-tier AWS environments',
          'Built Jenkins and Git CI/CD pipelines for 20+ applications',
          'Developed a Python-based Proof of Concept',
          'Collaborated with senior engineers to manage ServiceNow incidents']:
    check('deneyim', f'bullet birebir: {b[:42]}...', b in pdf and b in home)
check('deneyim', 'Nioyatech konumu tutarli',
      'Remote from Ottawa' in pdf and 'Remote from Ottawa' in home)
check('deneyim', 'eskimis bullet kalintisi yok',
      not any(x in site for x in ['Shadowed', 'first step toward', 'eliminated manual tracking',
                                  'Accelerated delivery for 20+']))

print("\n=== 5. CAPSTONE CERCEVESI " + "="*43)
cap = pages.get('projects/capstone/index.html', '')
check('capstone', 'resume 6 kisilik takimi belirtiyor', '6-person team' in pdf)
check('capstone', 'resume ikinci siteyi sahiplendigini soyluyor', 'Owned the 17-VM second site' in pdf)
check('capstone', 'site de ayni ayrimi yapiyor (cloud sahiplik / on-prem katki)',
      'solo' in cap and 'collaborativ' in cap)
check('capstone', '17 VM sayisi tutarli', '17' in pdf and '17' in cap)
check('capstone', 'resume 17 VM\'i DL380\'lere baglamiyor',
      '17-VM environment on two HP ProLiant' not in pdf)

print("\n=== 6. BECERILER (resume <-> site birebir) " + "="*27)
groups = {'Cloud & Automation': ['Azure','Terraform','Ansible','Helm','Jenkins'],
          'Systems & Virtualization': ['LDAP','Kerberos','SSSD','RAID','HP ProLiant','Veeam'],
          'Networking & Security': ['IPv4 subnetting','OSPF','OPNsense','tcpdump','Wireshark'],
          'Applications & Scripting': ['Tomcat','nginx','Caddy','PostgreSQL','Prometheus']}
for g, items in groups.items():
    miss = [i for i in items if not (i in pdf and i in home)]
    check('beceri', f'{g} ogeleri her ikisinde', not miss, f'eksik: {miss}')
check('beceri', 'site, resume\'de olmayan beceri iddia etmiyor',
      not any(x in home for x in ['802.11','802.1X','ArubaOS','CVSS','IDS/IPS','Packet Tracer']))

print("\n=== 7. OLU BAGLANTILAR (apex su an TLS hatasi veriyor) " + "="*15)
apex = re.compile(r'https://omerdengiz\.com')
check('link', 'site kaynaginda apex linki yok', not apex.search((ROOT/'dist/index.html').read_text(encoding='utf-8')))
check('link', 'github profilinde apex linki yok', not apex.search(gh))
check('link', 'repo README apex linki yok', not apex.search(repo))
check('link', 'canonical www gosteriyor', 'https://www.omerdengiz.com/' in (ROOT/'dist/index.html').read_text(encoding='utf-8'))

print("\n=== 8. MIMARI IDDIALARI (goc sonrasi) " + "="*32)
for name, blob in [('site', site), ('github', gh), ('repo README', repo)]:
    # Present-tense claims only. The word "cross-account" legitimately appears
    # in the post-mortem ("to exercise a cross-account boundary. That boundary
    # became the failure") and in a sentence stating there is no such step.
    claims = ['lives in a separate AWS account', 'across two AWS accounts',
              'in one AWS account, hosting infrastructure in another',
              'cross-account AWS static site', 'cross-account AWS architecture',
              'omerdengiz-hosting', 'omerdengiz-domain']
    hit = [c for c in claims if c in blob]
    check('mimari', f'{name}: guncel cross-account iddiasi yok', not hit, f'bulunan: {hit}')

print("\n=== 9. GITHUB PROFILI <-> RESUME " + "="*37)
check('github', 'rol satiri resume pozisyon sirasiyla uyumlu',
      'Systems Administration' in gh and
      (gh.find('Systems Administration') < gh.find('Cloud Infrastructure')
       if 'Cloud Infrastructure' in gh else True),
      'resume "Systems Administration" ile basliyor, profil baska sirada')
check('github', '17 VM ikinci siteye atfediliyor, iki-site toplamina degil',
      '17-VM two-site' not in gh,
      'teknik rapora gore 17 VM ikinci siteye ait; DL380 sunucular ilk sitede')
check('github', 'BGP / 802.11 kalintisi yok', 'BGP' not in gh and '802.11' not in gh)
check('github', 'Nioyatech + Interac ikisi de aniliyor', 'Nioyatech' in gh and 'Interac' in gh)

print("\n" + "="*70)
if findings:
    print(f"{len(findings)} BULGU:")
    for c,d,x in findings: print(f"  [{c}] {d}" + (f" -> {x}" if x else ''))
    sys.exit(1)
print("TEMIZ — uc yuzey arasinda celiski bulunamadi.")
