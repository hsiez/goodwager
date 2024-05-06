export async function fetchUserFromUsername(username: string, token:string): Promise<any> {
    const url = 'https://icpujtrkzstykzmcsutm.supabase.co/functions/v1/get_usernames';
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

export async function fetchFollowerWagerData(user_id: string, token:string): Promise<any> {
    const url = 'https://icpujtrkzstykzmcsutm.supabase.co/functions/v1/get_follower_wager_data';
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ "user_id": user_id })

    });

    const data = await response.json();

    return data;
}