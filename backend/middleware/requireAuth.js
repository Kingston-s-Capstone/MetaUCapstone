const { createClient } = require("@supabase/supabase-js")

const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
);

const requireAuth = async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) return res.status(401).json({ error: 'Missing token' });

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data?.user) {
        return res.status(401).json({ error: "Invalid or expired token "});
    }

    req.user = data.user;
    next();
};

module.exports = requireAuth;