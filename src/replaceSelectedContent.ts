import * as vscode from "vscode";
import { tsquery } from "@phenomnomnominal/tsquery";
import { getConfiguration } from "./utils";
import { Pos } from "./typing";

const { window } = vscode;

/**
 * 替换字符串
 * @param key 选中的内容
 * @param newKey 需要替换的内容
 * @returns
 */
export async function replaceSelectedContent(key: string, newKey: string) {
  const taggedTemplateNodesPos: Pos[] = [];

  const activeEditor = window.activeTextEditor;
  if (!activeEditor) {
    return;
  }

  const code = activeEditor.document.getText();
  const ast = tsquery.ast(code);
  const nodes = tsquery(ast, "TaggedTemplateExpression");

  nodes.forEach((node) => {
    const start = node.getStart();
    const end = node.getEnd();

    const startPos = activeEditor.document.positionAt(start + 1);
    const endPos = activeEditor.document.positionAt(end);

    taggedTemplateNodesPos.push({
      startLine: startPos.line,
      endLine: endPos.line
    });
  });

  const selection = activeEditor.selection;
  const { start, end } = selection;

  const document = activeEditor.document;
  const edit = new vscode.WorkspaceEdit();

  let isIntemplate = false;
  const len = taggedTemplateNodesPos.length;

  if (len) {
    for (let i = 0; i < len; i++) {
      const { startLine, endLine } = taggedTemplateNodesPos[i];
      if (start.line > startLine && end.line < endLine) {
        isIntemplate = true;
        break;
      }
    }
  }
  //选中key，如果没有引号，则包裹一个单引号
  if (!isIntemplate) {
    if (key.indexOf(`'`) === -1 && key.indexOf(`"`) === -1) {
      key = `'${key}'`;
    }
  }
  //newKey中，占位符为 %v，替换占位符的内容为key
  const newKeyWithPlaceholder = newKey.replace("%v", key);
  edit.replace(
    document.uri,
    new vscode.Range(start.line, start.character, end.line, end.character),
    newKeyWithPlaceholder
  );

  // 更新编辑器
  await vscode.workspace.applyEdit(edit);
}
