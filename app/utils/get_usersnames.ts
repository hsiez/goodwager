async function fetchUsername(username: string, token:string): Promise<any> {
    const url = 'https://icpujtrkzstykzmcsutm.supabase.co/functions/v1/get_usernames';
    console.log(url);
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "username": username })

    });

    const data = await response.json();

    return data;
}
export default fetchUsername;