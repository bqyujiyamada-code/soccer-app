import { NextResponse } from "next/server";
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";
import { docClient } from "@/lib/dynamodb";

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    const tableName = process.env.DYNAMODB_TABLE_NAME;

    if (!tableName) {
      throw new Error("DYNAMODB_TABLE_NAME が設定されていません");
    }
    if (!id) {
      return NextResponse.json({ error: "idが指定されていません" }, { status: 400 });
    }

    await docClient.send(
      new DeleteCommand({
        TableName: tableName,
        Key: { id },
      })
    );

    return NextResponse.json({ message: "Success" });
  } catch (error) {
    console.error("DynamoDB Delete Error:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { error: "削除に失敗しました", detail: message },
      { status: 500 }
    );
  }
}
