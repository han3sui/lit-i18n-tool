/**
 * 搜索
 */
import * as vscode from "vscode";
import { getConfiguration } from "./utils";

export async function searchKey(key?: string) {
  const include = getConfiguration("include").join(",");
  const exclude = getConfiguration("exclude").join(",");

  const files = await vscode.workspace.findFiles(`**/*.{${include}}`, `**/{${exclude}}`);

  const list: any[] = [];

  for (let i = 0; i < files.length; i++) {
    const file = await vscode.workspace.openTextDocument(files[i]);
    searchKeyInFile(file, list, key);
  }

  return Promise.resolve(list);
}

/**
 * 在文件中搜索字段
 */
function searchKeyInFile<T extends any[]>(file: vscode.TextDocument, list: T, key?: string) {
  const fn = getConfiguration("func") as string;
  const filePath = file.uri.path;

  for (let line = 0; line < file.lineCount; line++) {
    // 获取每一行文本
    const lineText = file.lineAt(line).text;

    if (key) {
      if (lineText.includes(`${fn}('${key}')`)) {
        // 查找指定的key
        const startCol = lineText.indexOf(`${fn}('${key}')`) + fn.length + 2;
        const endCol = startCol + key.length;
        const range = new vscode.Range(line, startCol + 1, line, endCol);
        list.push({
          uri: filePath,
          list: [
            {
              lineText: lineText,
              range,
              line: line + 1
            }
          ]
        });
      }
    } else {
      // 查找所有的key

      const fn = getConfiguration("func") as string;
      const str = `(?<=${fn}\\(').+?(?=')`;
      const re = new RegExp(str, "gi");
      const result = lineText.match(re);

      if (result?.length) {
        list.push({
          uri: filePath,
          list: [...result],
          line: line + 1
        });
      }
    }
  }
}
