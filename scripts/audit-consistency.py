"""Cross-surface consistency audit: resume PDF vs website vs GitHub profile.

Every check states what it expects and where. A finding is only reported when
the same *claim* is made differently on two surfaces, not when one surface
simply omits something the other mentions, which is normal (a resume skills
block is not an inventory of every technology in every project).
"""
import re, html, pathlib, sys
from pypdf import PdfReader

ROOT = pathlib.Path(__file__).resolve().parents[1]
GH   = pathlib.Path(r'C:\Algonquin\github-profile\README.md')

def norm(s): return ' '.join(s.split())
def detag(p): return norm(html.unescape(re.sub(r'<[^>]+>', ' ', p.read_text(encoding='utf-8'))))

# The tracked copy under src/assets/ is the one that actually ships, so it is
# what gets audited. The working master in the repo root is gitignored (this
# repo is public) and would make the audit unrunnable from a fresh clone.
RESUME = ROOT/'src/assets/resume/Omer_Dengiz_Resume.pdf'
if not RESUME.exists():
    RESUME = ROOT/'Omer_Dengiz_Resume.pdf'
pdf = norm(' '.join(p.extract_text() for p in PdfReader(RESUME).pages))
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
    # Present-tense architecture claims only. Incident narrative is covered
    # separately in category 13.
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

print("\n=== 10. YAYINLANAN BELGELER " + "="*42)
# Resume'yi eline alan biri siteye ve GitHub'a ulasabilmeli. Bu satir bir kez
# dustu ve kimse fark etmedi; tekrar dusmesin diye kontrol burada.
check('belge', 'resume iletisim satiri siteyi veriyor', 'omerdengiz.com' in pdf)
check('belge', "resume iletisim satiri GitHub'i veriyor", 'github.com/ofdengiz' in pdf)
check('belge', "resume LinkedIn'i veriyor", 'linkedin.com/in/omer-faruk-dengiz' in pdf)
check('belge', 'resume tek sayfa', len(PdfReader(RESUME).pages) == 1)

# Teknik rapor halka acik linkleniyor. Kapagi bir grup odevinin kapagiydi:
# ders kodu, profesor adi, takim adi ve bes sinif arkadasinin tam adi -- hepsi
# 1. sayfada. Kapak degistirildi; belgenin kalan 121 sayfasi zaten temizdi.
_rep = ROOT / 'public/assets/docs/Capstone_Technical_Report.pdf'
if _rep.exists():
    _r = PdfReader(_rep)
    _txt = ' '.join((pg.extract_text() or '') for pg in _r.pages)
    for _term in ['Raspberry', 'Pioneer', 'CST8248', 'Latremouille', 'Bailey', 'Kulla',
                  'Elyazid', 'Sidelkheir', 'Ru Wang', 'Rosseleve', 'Yiqin']:
        check('belge', f"teknik raporda '{_term}' gecmiyor", _term not in _txt)
    check('belge', 'teknik raporda ad dogru yaziliyor (Omer Deniz degil)',
          'Omer Deniz ' not in _txt and 'Omer Dengiz' in _txt)
    check('belge', 'rapor sayfa sayisi sitedeki notla uyusuyor',
          f'{len(_r.pages)} pages' in site, f'rapor {len(_r.pages)} sayfa')
    check('belge', 'kapak katki kapsamini durustce beyan ediyor',
          'six-person group submission' in (_r.pages[0].extract_text() or ''))
else:
    check('belge', 'teknik rapor public/ altinda duruyor', False, str(_rep))

print("\n=== 11. CAPSTONE KAYNAK REPOSU " + "="*39)
# detag() nitelikleri siler, bir href gorunur metin degildir: bu kontrol
# sayfanin ham HTML'ine bakmak zorunda.
_cap_html = (ROOT/'dist/projects/capstone/index.html')
check('repo', 'capstone sayfasi yayinlanan repoyu gosteriyor',
      _cap_html.exists() and
      'github.com/ofdengiz/clearroots-k8s-aws' in _cap_html.read_text(encoding='utf-8'))
check('repo', 'baglanti etiketi repoyu tum capstone sanmaya yol acmiyor',
      'Cloud site source' in cap,
      'duz "Source" etiketi 17-VM ortaminin tamaminin repo oldugunu ima eder')

print("\n=== 12. UZUN TIRE (yapay zeka izi) " + "="*35)
# Cumle baglaci olarak kullanilan uzun tire, bir metnin yapay zeka tarafindan
# yazildigini en cok ele veren isaretlerden biri. Kisa tire (EN) serbest:
# tarih araliklari ve "Solutions Architect - Associate" gibi resmi adlar icin
# dogru tipografi o. Yasaklanan sadece uzun tire.
EM = chr(8212)
_pages_em = {n: t.count(EM) for n, t in pages.items() if EM in t}
check('tire', 'gorunur sayfa metninde uzun tire yok', not _pages_em, str(_pages_em))
check('tire', 'resume PDF\'inde uzun tire yok', EM not in pdf)
check('tire', 'github profilinde uzun tire yok', EM not in gh)
check('tire', 'repo README\'sinde uzun tire yok', EM not in repo)

# og:image paylasim kartinda metin var ve grep onu goremez, o yuzden
# ureticisinin girdileri kontrol ediliyor.
_og = ROOT / 'scripts/generate_og.py'
if _og.exists():
    _src = _og.read_text(encoding='utf-8')
    check('tire', 'og karti ureticisinde uzun tire yok', EM not in _src)
    check('tire', 'og karti olu apex adresini basmiyor',
          '"omerdengiz.com"' not in _src,
          'apex TLS hatasi veriyor; kartta www yazmali')
    check('tire', 'og karti suresi dolmus sertifikayi one cikarmiyor',
          'AWS SAA' not in _src and '"SCREENING", "RCMP Level 2' in _src,
          'AWS sertifikalari Tem/Agu 2026 sona erdi; kartta guncel tarama yazmali')

print("\n=== 13. OLAY GECMISI ANLATIMI " + "="*40)
# Portfoy metni bir seyin ne oldugunu anlatir, basina ne geldigini degil.
# Hesap gocu, askiya alinan hesap ve apex sorunu bir olay kaydiydi ve uc
# yuzeyde birden anlatiliyordu. "Askiya alinmis hesap" bir bulut pozisyonu
# icin olumsuz bir soru da davet ediyor. Bu ifadeler geri gelmesin.
_history = ['suspended account', 'became unreachable', 're-applied into',
            'second AWS account', 'different account', 'after learning why',
            'post-mortem', 'used to be split', 'went out of reach',
            'original hosting account', 'across accounts', 'CNAMEAlreadyExists',
            'headings it replaces', 'Replaces animated']
for name, blob in [('site', site), ('github', gh), ('repo README', repo)]:
    hit = [h for h in _history if h.lower() in blob.lower()]
    check('gecmis', f'{name}: olay gecmisi anlatimi yok', not hit, f'bulunan: {hit}')

print("\n=== 14. IDDIA <-> KANIT " + "="*46)
# Resume'nin capstone maddesi "deployed via Helm charts" diyordu; yayinlanan
# capstone reposunda Helm yok, duz manifestler var. Helm'in kaniti petclinic.
check('kanit', 'resume capstone maddesi Helm iddia etmiyor',
      'cluster deployed via Helm' not in pdf)
check('kanit', 'Helm petclinic kartinda kanitiyla birlikte duruyor',
      'Helm charts for deployment' in home)

# Cisco NetAcad "CCNA: Switching, Routing and Wireless Essentials" bir kurs,
# CCNA sinavi degil. Sertifikalarin yaninda isaretsiz durmasi daha guclu bir
# iddia gibi okunuyordu.
check('kanit', 'baslik blogu kursu sertifika gibi gostermiyor',
      'AWS SAA · CCP · CCNA' not in home)
check('kanit', 'resume Cisco kursunu Training satirinda, kurs olarak veriyor',
      'Training: Cisco Networking Academy' in pdf and '(course)' in pdf)
check('kanit', 'github profili Cisco rozetini sertifika olarak gostermiyor',
      'alt="CCNA"' not in gh)

# Resume ozeti ile sitenin ozeti ayni metin olmali.
_sum = re.search(r'Algonquin College Networking graduate.*?Mandarin\.', pdf)
check('kanit', 'resume ozeti sitede birebir', bool(_sum) and _sum.group(0) in home,
      'profile.ts summary resume ile ayrismis')

# Profilde calismayan ucuncu taraf gorsel olmasin (servis 503 donuyordu).
check('kanit', 'github profilinde kirik istatistik gorseli yok', 'github-readme-stats' not in gh)

# Private yapilan repolara hicbir yuzey baglanmasin.
_private = ['filmapp', 'aws-python-workspace', 'jenkinsfile-pipeline-project',
            'jenkins-maven-project']
for name, blob in [('site', ' '.join(p.read_text(encoding='utf-8') for p in (ROOT/'dist').rglob('*.html'))),
                   ('github', gh), ('repo README', repo)]:
    hit = [r for r in _private if f'ofdengiz/{r}' in blob]
    check('kanit', f'{name}: private repolara baglanti yok', not hit, f'bulunan: {hit}')

print("\n=== 15. SURESI DOLAN SERTIFIKALAR " + "="*36)
# AWS SAA Agu 2026, CCP Tem 2026 sona erdi (LinkedIn "Expired" diyor). Her
# yuzey bunu acikca soylemeli; tarihsiz bir "AWS SAA" gecerli iddiasi olur.
check('sure', 'resume iki AWS sertifikasini da expired olarak veriyor', pdf.count('expired') >= 2)
check('sure', 'site sertifika listesinde expired isareti var', home.count('expired') >= 2)
check('sure', 'github profilinde expired isareti var', gh.count('expired') >= 2)
check('sure', 'site baslik blogu tarihsiz AWS iddiasi tasimiyor', 'AWS SAA · CCP' not in home)
check('sure', 'github profilinde AWS sertifika rozeti yok', 'badge/AWS_Certified' not in gh)

print("\n" + "="*70)
if findings:
    print(f"{len(findings)} BULGU:")
    for c,d,x in findings: print(f"  [{c}] {d}" + (f" -> {x}" if x else ''))
    sys.exit(1)
print("TEMIZ: uc yuzey arasinda celiski bulunamadi.")
