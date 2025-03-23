import { BigQuery } from "@google-cloud/bigquery";

export async function GET() {
  try {
    // 環境変数から個別にクレデンシャル情報を取得
    const credentials = {
      type: "service_account",
      project_id: process.env.GOOGLE_PROJECT_ID,
      private_key_id: process.env.GOOGLE_PRIVATE_KEY_ID,
      private_key: process.env.GOOGLE_PRIVATE_KEY,
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      client_id: process.env.GOOGLE_CLIENT_ID,
      auth_uri: "https://accounts.google.com/o/oauth2/auth",
      token_uri: "https://oauth2.googleapis.com/token",
      auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
      client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(process.env.GOOGLE_CLIENT_EMAIL)}`,
      universe_domain: "googleapis.com"
    };

    const bigquery = new BigQuery({
      projectId: process.env.GOOGLE_PROJECT_ID,
      credentials
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
    return new Response(JSON.stringify({ error: "データ取得に失敗しました", details: error.message }), {
      status: 500,
    });
  }
}