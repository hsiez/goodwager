async function fetchUsername(username: string): Promise<any> {
    const response = await fetch(`https://api.clerk.com/v1/users?username=${username}`, {
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${process.env.CLERK_SECRET_KEY}`,
            'Content-Type': 'application/json'
        }
    });
    const data = await response.json();
    console.log(data);
}
export default fetchUsername;