async function fetchUser(req, res) {
    const users = [
        {id: "1", name: "Fredrick Mills", role: "admin"},
        {id: "2", name: "Prince Arthur", role: "staff"},
        {id: "3", name: "John Doe", role: "staff"},
        {id: "4", name: "Jane Williams", role: "staff"},
        {id: "5", name: "Peter Pan", role: "staff"}
    ]

    try {
        res.status(200).json({
            status: true,
            users: users
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({ success: false, message: "Internal Server Error" });

    }

}

module.exports = fetchUser;