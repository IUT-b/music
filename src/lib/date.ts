export function getDateInJST(): Date {
    // 現在日時を日本時間で取得（年月日だけ）
    const currentDateInJST = new Date().toLocaleDateString("en-US", {
        timeZone: "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    });

    // Dateオブジェクトに変換し、時間部分を切り捨て
    const date = new Date(currentDateInJST);

    // 時刻部分を00:00:00に設定
    date.setHours(0, 0, 0, 0);

    return date;
}

export function formatDate(dateString: string) {
    const date = new Date(dateString);  // ISO 8601形式の日付をDateオブジェクトに変換
    return date.toISOString().split('T')[0];  // 'YYYY-MM-DD'形式で返す
};