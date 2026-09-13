import json
import os
import shutil

root = r"c:\Users\tadah\informationⅠ-app"
fig = os.path.join(root, "public", "exam-figures")

mapping = {
    "specimen_q1_fig1_parity_page.png": "specimen_p06_page.png",
    "specimen_q1_fig2_logic_gate.png": "specimen_p08_img07.png",
    "specimen_q1_fig2_logic_page.png": "specimen_p08_page.png",
    "specimen_q1_fig3_logic.png": "specimen_p09_img06.png",
    "specimen_q1_fig3_truth.png": "specimen_p09_img13.png",
    "specimen_q1_fig3_page.png": "specimen_p09_page.png",
    "specimen_q1_fig4_railway.png": "specimen_p11_img01.png",
    "specimen_q1_fig5_ranking.png": "specimen_p11_img02.png",
    "specimen_q1_fig45_page.png": "specimen_p11_page.png",
    "specimen_q2a_fig1_qr.png": "specimen_p13_img05.png",
    "specimen_q2a_fig1_page.png": "specimen_p12_page.png",
    "specimen_q2a_fig23_finder_page.png": "specimen_p13_page.png",
    "specimen_q2a_fig4_tool.png": "specimen_p14_img01.png",
    "specimen_q2a_fig4_page.png": "specimen_p14_page.png",
    "specimen_q2b_fig1_sim.png": "specimen_p19_img01.png",
    "specimen_q2b_fig1_page.png": "specimen_p19_page.png",
    "specimen_q2b_fig2_hist_page.png": "specimen_p20_page.png",
    "specimen_q3_fig1_code_page.png": "specimen_p25_page.png",
    "specimen_q3_fig2_code_page.png": "specimen_p27_page.png",
    "specimen_q4_fig12_scatter.png": "specimen_p30_page.png",
    "specimen_q4_fig3_page.png": "specimen_p32_page.png",
    "specimen_q4_fig4_scatter.png": "specimen_p34_img01.png",
    "specimen_q4_fig4_page.png": "specimen_p34_page.png",
    "specimen_q4_fig56_page.png": "specimen_p37_page.png",
}

index = []
for dest, src in mapping.items():
    sp = os.path.join(fig, src)
    dp = os.path.join(fig, dest)
    if os.path.exists(sp):
        shutil.copy2(sp, dp)
        index.append(
            {
                "filename": dest,
                "source_pdf": "試作問題『情報Ⅰ』問題.pdf",
                "from": src,
                "url": f"/exam-figures/{dest}",
            }
        )
        print("ok", dest)
    else:
        print("MISSING", src)

lines = [
    "# 試験図版ファイル一覧（試作問題）",
    "",
    "元PDF: `試作問題『情報Ⅰ』問題.pdf`",
    "",
    "| ファイル名 | URL |",
    "|---|---|",
]
for item in index:
    lines.append(f"| `{item['filename']}` | `{item['url']}` |")

with open(os.path.join(fig, "FIGURES.md"), "w", encoding="utf-8") as f:
    f.write("\n".join(lines) + "\n")

with open(os.path.join(fig, "figure_index.json"), "w", encoding="utf-8") as f:
    json.dump({"specimen": index}, f, ensure_ascii=False, indent=2)

print("curated", len(index))
