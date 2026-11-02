#!/usr/bin/env python3
"""Codex CLI の画像生成で記事用の図を作り、WebP にして public/ に保存する(開発用)。

    python scripts/codex-image.py --prompt-file tmp/label.txt --out public/images/guides/label-sample.webp
    python scripts/codex-image.py --prompt "…" --out public/images/guides/x.webp --size 1536x1024

Windows では Codex 自身に画像をコピーさせると、画像データをコマンド引数で渡そうとして
「ファイル名または拡張子が長すぎます」で失敗し、そのたびに再生成して利用枠を余計に使う。
そのため Codex には生成だけをさせ、~/.codex/generated_images/<セッションID>/ から取り出す。
画像内の文字は必ず目視で確認すること(生成のたびに誤字が出る可能性がある)。
"""
from __future__ import annotations

import argparse
import re
import shutil
import subprocess
import sys
from pathlib import Path

from PIL import Image

CODEX = shutil.which("codex") or shutil.which("codex.cmd") or "codex"
GENERATED = Path.home() / ".codex" / "generated_images"

for _s in (sys.stdout, sys.stderr):
    try:
        _s.reconfigure(encoding="utf-8")
    except Exception:
        pass


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--prompt")
    ap.add_argument("--prompt-file")
    ap.add_argument("--out", required=True, help="保存先(.webp)")
    ap.add_argument("--size", default="1536x1024")
    ap.add_argument("--width", type=int, default=1200, help="保存時の横幅(px)")
    ap.add_argument("--quality", type=int, default=82)
    args = ap.parse_args()

    content = Path(args.prompt_file).read_text(encoding="utf-8") if args.prompt_file else args.prompt
    if not content:
        ap.error("--prompt か --prompt-file を指定してください")
    out = Path(args.out)
    if out.suffix.lower() != ".webp":
        ap.error("--out は .webp にしてください")

    prompt = (
        "画像生成ツールで画像を1枚だけ生成してください。\n"
        f"- サイズ/比率: {args.size}\n"
        "- 実在の銘柄・企業ロゴ・人物に似せない\n"
        f"- 内容: {content}\n\n"
        "生成した画像をファイルにコピー・保存する操作は一切しないでください(こちらで取り出します)。"
        "生成が終わったら「完了」とだけ答えてください。"
    )
    # プロンプトは標準入力で渡す(引数だと Windows の codex.cmd 経由で改行以降が切れる)
    r = subprocess.run(
        [CODEX, "exec", "--skip-git-repo-check", "-s", "read-only", "-"],
        input=prompt, capture_output=True, text=True, encoding="utf-8", errors="replace",
        shell=CODEX.lower().endswith(".cmd"), timeout=600,
    )
    log = (r.stdout or "") + (r.stderr or "")
    m = re.search(r"session id:\s*([0-9a-f-]{36})", log)
    if not m:
        sys.exit(f"Codex のセッションIDが見つかりません(exit {r.returncode})\n{log[-2000:]}")
    images = sorted((GENERATED / m.group(1)).glob("*.png"), key=lambda p: p.stat().st_mtime)
    if not images:
        sys.exit(f"画像が生成されていません(セッション {m.group(1)})\n{log[-2000:]}")
    if len(images) > 1:
        print(f"注意: {len(images)} 枚生成されました。最後の1枚を使います", file=sys.stderr)

    src = images[-1]
    out.parent.mkdir(parents=True, exist_ok=True)
    with Image.open(src) as im:
        im = im.convert("RGB")
        if im.width > args.width:
            im = im.resize((args.width, round(im.height * args.width / im.width)), Image.LANCZOS)
        im.save(out, "WEBP", quality=args.quality, method=6)
        size = im.size
    print(f"元画像: {src}")
    print(f"保存: {out} ({size[0]}x{size[1]}, {out.stat().st_size // 1024}KB)")


if __name__ == "__main__":
    main()
