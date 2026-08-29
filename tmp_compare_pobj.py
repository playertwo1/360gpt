import zipfile, glob, os, re, xml.etree.ElementTree as ET
BASE=r'C:\Users\fael\Downloads\Pobj-20260829T033921Z-1-001\Pobj\Agosto'
NS={'m':'http://schemas.openxmlformats.org/spreadsheetml/2006/main'}
def read(path):
    z=zipfile.ZipFile(path); strings=[]
    if 'xl/sharedStrings.xml' in z.namelist():
        root=ET.fromstring(z.read('xl/sharedStrings.xml'))
        strings=[''.join(t.text or '' for t in si.iter('{%s}t'%NS['m'])) for si in root]
    out=[]
    for fn in sorted(n for n in z.namelist() if n.startswith('xl/worksheets/sheet') and n.endswith('.xml')):
        root=ET.fromstring(z.read(fn)); row=[]
        for c in root.findall('.//m:c',NS):
            v=c.find('m:v',NS); val='' if v is None else (v.text or '')
            if c.attrib.get('t')=='s' and val: val=strings[int(val)]
            if c.attrib.get('t')=='inlineStr': val=''.join(t.text or '' for t in c.iter('{%s}t'%NS['m']))
            if val: row.append((c.attrib.get('r',''),val))
        out.append(row)
    return out
for p in glob.glob(BASE+'\\*.xlsx'):
    print('\n###',os.path.basename(p))
    sheets=read(p)
    for i,cells in enumerate(sheets,1):
        print('sheet',i,'nonempty',len(cells))
        print(' | '.join(f'{a}={b}' for a,b in cells[:45]))
