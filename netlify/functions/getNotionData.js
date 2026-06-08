const { Client } = require("@notionhq/client");
const notion = new Client({ auth: process.env.NOTION_API_KEY });

function getText(prop) {
  if (!prop) return "";
  if (prop.type === "title") return (prop.title || []).map(t => t.plain_text).join("") || "";
  if (prop.type === "rich_text") return (prop.rich_text || []).map(t => t.plain_text).join("") || "";
  if (prop.type === "select") return prop.select?.name || "";
  if (prop.type === "url") return prop.url || "";
  if (prop.type === "number") return prop.number != null ? String(prop.number) : "";
  if (prop.type === "checkbox") return prop.checkbox ? "TRUE" : "FALSE";
  return "";
}

exports.handler = async function (event, context) {
  const headers = { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" };
  try {
    const results = [];
    let cursor = undefined;
    do {
      const response = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        start_cursor: cursor,
        page_size: 100,
      });
      results.push(...response.results);
      cursor = response.has_more ? response.next_cursor : undefined;
    } while (cursor);

    const rows = results.map(page => {
      const p = page.properties;
      return {
        type: getText(p["type"]), visible: getText(p["visible"]) || "TRUE",
        classType: getText(p["classType"]), title: getText(p["title"]),
        academy: getText(p["academy"]), category: getText(p["category"]),
        grade: getText(p["grade"]), area: getText(p["area"]),
        dayTime: getText(p["dayTime"]), current: getText(p["current"]),
        target: getText(p["target"]), routeStatus: getText(p["routeStatus"]),
        routeArea: getText(p["routeArea"]), pickup: getText(p["pickup"]),
        status: getText(p["status"]), description: getText(p["description"]),
        tuition: getText(p["tuition"]), trial: getText(p["trial"]),
        feeNote: getText(p["feeNote"]), linkUrl: getText(p["linkUrl"]),
        kakaoUrl: getText(p["kakaoUrl"]), homepage: getText(p["homepage"]),
        contactUrl: getText(p["contactUrl"]),
      };
    });
    return { statusCode: 200, headers, body: JSON.stringify(rows) };
  } catch (error) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: error.message }) };
  }
};
