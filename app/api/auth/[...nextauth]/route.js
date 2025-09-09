import NextAuth from "next-auth"
import GithubProvider from "next-auth/providers/github"
import { MongoDBAdapter } from "@auth/mongodb-adapter"
import dbConfig from "@/utils/dbConfig"
import User from "@/utils/models/User"

export const authOptions = {

    // adapter: MongoDBAdapter(dbConfig()),

    providers: [
        GithubProvider({
            clientId: process.env.GITHUB_ID,
            clientSecret: process.env.GITHUB_SECRET,
        }),
    ],

    callbacks: {

        async signIn({ user, account, profile }) {
            await dbConfig();
            try {
                if (account.provider === 'github') {
                    const dbUser = await User.findOneAndUpdate(
                        { email: user.email },
                        {
                            email: user.email,
                            name: user.name,
                            githubId: account.providerAccountId,
                            avatar: user.image,
                            username: profile.login,
                        },
                        { upsert: true, new: true }
                    );
                    user.premium = dbUser.premium || false;
                    user.mongoId = dbUser._id.toString();
                    user.id = dbUser._id.toString();
                }
                return true;
            } catch (error) {
                console.error("Error in signIn callback:", error);
                return false;
            }
        },

        async jwt({ token, user, profile }) {
            if (user) {
                const mongoId = user.mongoId || user.id;
                token.id = mongoId || token.id;
                token.mongoId = mongoId || token.mongoId;
                token.email = user.email;
                token.name = user.name;
                token.avatar = user.image;
                token.username = user.username || profile?.login || token.username;
                token.premium = user.premium;
            }
            return token;
        },

        async session({ session, token }) {
            const userId = token.mongoId || token.id;
            session.user = {
                ...session.user,
                id: userId,
                email: token.email,
                name: token.name,
                avatar: token.avatar,
                username: token.username,
                premium: token.premium
            }
            return session;
        }
    },

    session: {
        strategy: "jwt",
        maxAge: 30 * 24 * 60 * 60,
    },

    pages: {
        signIn: "/auth",
        signOut: "/dashboard",
        error: "/auth/error",
    },

    secret: process.env.NEXTAUTH_SECRET
}

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };