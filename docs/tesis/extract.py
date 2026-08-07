import zipfile, re, html
z = zipfile.ZipFile("v2 Proyecto de Graduación José Benjamin de Leon - copia.docx")
xml = z.read("word/document.xml").decode("utf-8")
xml = xml.replace("</w:p>", "</w:p>\n")
text = re.sub(r"<[^>]+>", "", xml)
text = html.unescape(text)
out = r"C:\Users\USUARIO\AppData\Local\Temp\claude\C--Users-USUARIO-OneDrive-Escritorio-uni-frontend-frontend\b04c0ae3-10b5-4122-b22d-d14c5659ddea\scratchpad\thesis.txt"
with open(out, "w", encoding="utf-8") as f:
    f.write(text)
print("chars:", len(text))
