---
description: main を最新化して元のブランチに戻る（作業中の変更は stash で退避）
---

以下の手順を順番に実行してください。各ステップでエラーが出たら停止してユーザーに報告すること。

1. `git status` で作業ツリーの状態と現在のブランチ名を確認する。現在のブランチ名を `ORIG_BRANCH` として控える。
2. `ORIG_BRANCH` が `main` の場合は、stash 不要・ブランチ切り替え不要。`git fetch origin` → `git pull --ff-only origin main` だけ実行して終了する。
3. 作業中の変更（staged / unstaged いずれか）がある場合のみ `git stash push -u -m "sync-main: auto stash"` で退避する。stash したかどうかを `DID_STASH` として控える。変更がなければ stash しない。
4. `git checkout main` で main に切り替える。
5. `git fetch origin` を実行する。
6. `git pull --ff-only origin main` で main を最新化する。fast-forward できない場合は停止してユーザーに報告する（destructive な操作は行わない）。
7. `git checkout $ORIG_BRANCH` で元のブランチに戻る。
8. `DID_STASH` が真の場合のみ `git stash pop` で退避した変更を戻す。コンフリクトが起きたら停止してユーザーに報告する。
9. 最後に何をしたか（main の更新範囲・stash の有無・戻った先のブランチ）を1〜2行で簡潔に報告する。

注意:
- destructive なコマンド（`reset --hard`, `checkout -- .`, force push など）は使わない。
- `pull --ff-only` が失敗した場合はマージや rebase を勝手に行わない。
- stash pop でコンフリクトしたら自動解決せず、ユーザーに判断を委ねる。
