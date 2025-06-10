"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Stats } from "@/components/ui/stats";
import { notFound, useParams } from "next/navigation";

export default function ProfilePage() {
  const params = useParams();

  // Exemple de données utilisateur (à remplacer par des données réelles)
  const users = [
  {
    name: "Jean Dupont",
    username: "jean_dupont",
    bio: "Développeur web passionné, amateur de café ☕ et de voyages 🌍.",
    email: "jean.dupont@email.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    banner: "https://images.pexels.com/photos/417173/pexels-photo-417173.jpeg?auto=compress&w=800&q=80",
    stats: { posts: 128, followers: 1024, following: 321 },
  },
  {
    name: "Marie Curie",
    username: "marie_curie",
    bio: "Physicienne et chimiste, pionnière dans le domaine de la radioactivité.",
    email: "marie.curie@email.com",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    banner: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=compress&w=800&q=80",
    stats: { posts: 256, followers: 2048, following: 432 },
  },
];

const user = users.find(u => u.username === params.username);
  // Si l'utilisateur n'est pas trouvé, on peut rediriger ou afficher un message
  if (!user) {
    return notFound();
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col items-center">
      {/* Conteneur principal relatif */}
      <div className="w-full max-w-5xl relative">
        {/* Bannière */}
        <div className="h-60 bg-neutral-300 rounded-b-2xl overflow-hidden shadow">
          <img
            src={user.banner}
            alt="Bannière"
            className="object-cover w-full h-full"
          />
        </div>
        {/* Avatar positionné en dehors de la bannière */}
        <div className="absolute left-15 -bottom-14 z-20">
          <Avatar className="w-32 h-32 border-4 border-neutral-100 bg-white">
            <AvatarImage src={user.avatar} alt={user.username} className="object-cover w-full h-full" />
            <AvatarFallback>
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="7.5" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                <path stroke="currentColor" strokeWidth="2" d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none" />
              </svg>
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
      {/* Profile Info */}
      <div className="w-full gap-8 max-w-5xl flex flex-col md:flex-row items-center justify-between mt-10 px-16 relative">
      <div className="flex flex-col md:flex-row items-center md:items-end w-full">
        
        {/* Infos utilisateur */}
        <div className="flex-1 flex flex-col items-center md:items-start mt-4 md:mt-0">
        <div className="flex flex-col md:flex-row md:items-center w-full">
          <div className="flex-1">
          <h1 className="text-3xl font-bold">{user.name}</h1>
          <span className="text-gray-500 text-lg">@{user.username}</span>
          </div>
          
        </div>
        <p className="text-gray-700 mt-2 max-w-2xl text-center md:text-left">{user.bio}</p>
        <span className="text-gray-400 text-sm mt-1 block">{user.email}</span>
        </div>
      </div>
      

      <div className="flex flex-col items-center gap-6 mt-6 md:mt-0 md:ml-8">
        {/* Bouton Modifier au-dessus */}
        <Button
          className="px-6 py-2 rounded-half bg-primary text-white font-medium transition-all duration-200 hover:bg-primary/90 hover:scale-103 focus:outline-none"
        >
          Modifier le profil
        </Button>
        {/* Stats */}
        <div className="flex gap-6">
          <Stats label="Posts" value={user.stats.posts} />
          <Stats label="Followers" value={user.stats.followers} />
          <Stats label="Following" value={user.stats.following} />
        </div>
      </div>
      </div>
      {/* Tabs */}
      <div className="w-full max-w-5xl mt-8 border-b border-neutral-200 flex px-16">
        <Button variant="ghost" className="py-3 px-6 font-semibold border-b-2 border-primary text-primary focus:outline-none rounded-none border-0 border-b-2 border-primary">
          Posts
        </Button>
        <Button variant="ghost" className="py-3 px-6 font-semibold text-gray-500 hover:text-primary cursor-pointer transition rounded-none border-0">
          Médias
        </Button>
        <Button variant="ghost" className="py-3 px-6 font-semibold text-gray-500 hover:text-primary cursor-pointer transition rounded-none border-0">
          Likes
        </Button>
      </div>
      {/* User Posts Preview */}
      <div className="w-full max-w-5xl px-16 mt-4 space-y-6">
      {[1, 2, 3].map((id) => (
        <div
        key={id}
        className="bg-white rounded-xl shadow-sm p-6 flex gap-4 items-start hover:shadow-md transition"
        >
        <Avatar className="w-12 h-12">
          <AvatarImage src={user.avatar} alt="Avatar" />
          <AvatarFallback>
                <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <circle cx="12" cy="7.5" r="4" stroke="currentColor" strokeWidth="2" fill="none" />
                <path stroke="currentColor" strokeWidth="2" d="M4 20c0-4 4-6 8-6s8 2 8 6" fill="none" />
                </svg>
            </AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center gap-2">
          <span className="font-semibold">{user.name}</span>
          <span className="text-gray-500 text-sm">@{user.username}</span>
          <span className="text-gray-400 text-xs">· 2h</span>
          </div>
          <p className="mt-1 text-gray-800 text-base leading-relaxed">
          Ceci est un exemple de post utilisateur. #DéveloppementWeb
          </p>
          <div className="flex gap-6 mt-3 text-gray-500 text-sm">
          <button className="hover:text-blue-600 transition">Commenter</button>
          <button className="hover:text-pink-500 transition">Like</button>
          <button className="hover:text-green-600 transition">Partager</button>
          </div>
        </div>
        </div>
      ))}
      </div>
    </div>
  );
}