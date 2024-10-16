import { DynamoDB } from "aws-sdk";
import crypto from "crypto";
import { APIGatewayProxyEvent } from "aws-lambda";

export async function list() {
  const dynamoDb = new DynamoDB({
    region: process.env.AWS_REGION || "ap-northeast-1",
  });
  const result = await dynamoDb
    .scan({
      TableName: "tasks",
    })
    .promise();

  const tasks = result.Items?.map((item) => ({
    id: item.id.S,
    title: item.title.S,
  }));

  return { tasks };
}

export async function post(event: APIGatewayProxyEvent) {
  if (!event.body) {
    throw new Error("Request body is empty");
  }
  const requestBody = JSON.parse(event.body);

  const item = {
    id: { S: crypto.randomUUID() },
    title: { S: requestBody.title },
  };

  const dynamoDb = new DynamoDB({
    region: process.env.AWS_REGION || "ap-northeast-1",
  });

  await dynamoDb
    .putItem({
      TableName: "tasks",
      Item: item,
    })
    .promise();

  return item;
}
