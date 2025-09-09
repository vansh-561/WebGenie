// "use client";

// import { useAuth, useUser } from "@clerk/nextjs";

// export default function Profile() {
//     const { isLoaded, userId, sessionId } = useAuth();
//     const { isSignedIn, user } = useUser();

//     if (!isLoaded || !isSignedIn || !userId) {
//         return null;
//     }

//     return (
//         <>
//             <div>
//                 Hello, {userId}! Your current active session is {sessionId}.
//             </div>
//             <div>
//                 Hello, {user.firstName}, welcome to WebGenie logged in via Clerk! <br />
//                 <strong>Name:</strong> {user.fullName} <br />
//                 <strong>Email:</strong> {user.emailAddresses[0].emailAddress} <br />
//                 <strong>Profile Image:</strong> <img src={user.imageUrl} alt="Profile" className='border-2 border-black rounded-full w-40' /><br />
//             </div>
//         </>
//     )
// }
