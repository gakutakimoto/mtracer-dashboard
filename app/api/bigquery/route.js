import { BigQuery } from "@google-cloud/bigquery";

export async function GET() {
  try {
    const bigquery = new BigQuery({
      projectId: "m-tracer-data-dashboard",
      keyFilename: "service-account.json",
    });

    const query = `
      SELECT
        profileHeight,
        impactHeadSpeed,
        impactGripSpeed,
        estimateCarry,
        topFaceAngleToHorizontal,
        height_category,
        cluster,
        impactClubPath,
        impactHandFirst,
        impactAttackAngle,
        impactRelativeFaceAngle, 
        halfwaybackFaceAngleToVertical, 
        downSwingShaftRotationMax,
        impactAttackAngle,
        impactFaceAngle,
        maxHeadSpeed,
        swing_type,
        success,
        club_type,
        COALESCE(impactAttackAngle, 0) as impactAttackAngle,
        COALESCE(swing_type, '') as swing_type,
        COALESCE(club_type, '') as club_type
      FROM \`m-tracer-data-dashboard.m_tracer_swing_data.sample\`
      LIMIT 10000;
    `;

    const [rows] = await bigquery.query(query);
    return Response.json(rows);
  } catch (error) {
    console.error("BigQueryエラー:", error);
    return new Response(JSON.stringify({ error: "データ取得に失敗しました" }), {
      status: 500,
    });
  }
}