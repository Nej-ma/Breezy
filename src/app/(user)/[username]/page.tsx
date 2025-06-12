"use client";
import { Avatar, AvatarFallback, AvatarImage, UserPlaceholderIcon } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Stats } from "@/components/custom/stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ArrowLeft, Calendar, Flag, Heart, ImageIcon, LinkIcon, MapPin, MessageCircle, MoreHorizontal, Pencil, Send, Sparkles, StickyNote, UserRoundPen, UserRoundPlus } from "lucide-react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { Post } from "@/components/custom/post";
import { useState } from "react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

// Exemple de données utilisateur (à remplacer par des données réelles)
  const users = [
  {
    name: "Jean Dupont",
    username: "jean_dupont",
    bio: "Développeur web passionné, amateur de café ☕ et de voyages 🌍.",
    email: "jean.dupont@email.com",
    avatar: "https://randomuser.me/api/portraits/men/32.jpg",
    banner: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=compress&w=1600&q=90",
    stats: { posts: 128, followers: 1024, following: 321 },
    location: "Paris, France",
    website: "jeandupont.dev",
    joinDate: "2021",
  },
  {
    name: "Marie Curie",
    username: "marie_curie",
    bio: "Physicienne et chimiste, pionnière dans le domaine de la radioactivité.",
    email: "marie.curie@email.com",
    avatar: "https://randomuser.me/api/portraits/women/32.jpg",
    banner: "https://images.unsplash.com/photo-1465101046530-73398c7f28ca?auto=compress&w=1600&q=90",
    stats: { posts: 256, followers: 2048, following: 432 },
    location: "Varsovie, Pologne",
    website: "mariecurie.fr",
    joinDate: "2019",
  },
];

// Sample posts data
const samplePosts = [
  {
    id: 1,
    content:
      "Excited to announce that I'll be speaking at the upcoming React Conference! Can't wait to share my insights on modern web development 🚀 #ReactConf #WebDev",
    timestamp: "2h",
    likes: 89,
    comments: 23,
    reposts: 12,
    tags: ["ReactConf", "WebDev"],
    pinned: true,
  },
  {
    id: 2,
    content:
      "Just finished building a new feature for our app using Next.js 13. The new app directory is a game changer! The developer experience is incredible.",
    timestamp: "1d",
    likes: 156,
    comments: 34,
    reposts: 28,
    tags: ["NextJS", "WebDev"],
  },
  {
    id: 3,
    content:
      "Working late tonight on some exciting AI integrations. The possibilities are endless when you combine creativity with technology! 🤖✨",
    timestamp: "2d",
    likes: 203,
    comments: 45,
    reposts: 31,
    tags: ["AI", "Tech"],
    pinned: true,
  },
];

export default function ProfilePage() {
  const params = useParams();

  const user = users.find(u => u.username === params.username);
  // Si l'utilisateur n'est pas trouvé, on peut rediriger ou afficher un message
  if (!user) {
    return notFound();
  }

  const [posts, setPosts] = useState(samplePosts);

  const handleTogglePin = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, pinned: !p.pinned } : p
      )
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">

      {/* Floating Header */}
      <div className="bg-white/60 backdrop-blur-md sticky top-0 z-11 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link href="/" className="flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-light)] transition-colors">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">{user.name}</h1>
              <Sparkles className="w-4 h-4 text-[var(--primary-light)]" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Banner */}
      <div className="relative h-64 overflow-hidden ">
        <img
          src={user.banner || "/placeholder.svg"}
          alt="Banner"
          className="w-full h-full object-cover"
        />
      </div>

      {/* Profile Content with Unique Layout */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative">

        {/* Profile Card - Floating Design */}
        <div className="bg-white rounded-2xl shadow-xl border border-blue-100 -mt-20 relative z-10 p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center gap-8">

            {/* Avatar Section */}
            <div className="flex flex-col items-center">
              <div className="relative">
                <Avatar className="w-28 h-28 ">
                  <AvatarImage src={user.avatar || "/placeholder.svg"}  alt={user.name} />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
                      <UserPlaceholderIcon className="w-16 h-16 text-white-400" />
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-[var(--primary)] to-[var(--primary-light)] rounded-full flex items-center justify-center shadow-lg">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              </div>

              {/* Stats Cards */}
              <div className="flex gap-4 mt-4">
                <Stats label="Posts" value={user.stats.posts} />
                <Stats label="Followers" value={user.stats.followers} />
                <Stats label="Following" value={user.stats.following} />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">{user.name}</h2>
                  <p className="text-[var(--primary-light)] font-medium">@{user.username}</p>
                </div>

                <div className="flex gap-2 items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="rounded-full border-gray-300 hover:border-blue-300">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem className="cursor-pointer">
                        <Send className="w-4 h-4 text-[var(--primary)]" />
                        Envoyer un message
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="cursor-pointer text-red-600 focus:text-red-600 focus:bg-red-50">
                        <Flag className="w-4 h-4" />
                        Signaler
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <Button
                    className="rounded-full px-4 py-2 transition"
                    variant="default"
                  >
                    <Pencil className="w-4 h-4" />
                    Modifier le profil
                  </Button>
                  <Button
                    className="rounded-full px-4 py-2 transition"
                    variant="default"
                  >
                    <UserRoundPlus className="w-4 h-4" />
                    Suivre
                  </Button>
                </div>
              </div>

              {/* Bio and Additional Info */}
              <p className="text-gray-700 leading-relaxed mt-4 mb-4">{user.bio}</p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {user.location && (
                  <div className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
                    <MapPin className="w-3 h-3" />
                    <span>{user.location}</span>
                  </div>
                )}
                {user.website && (
                  <div className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
                    <LinkIcon className="w-3 h-3" />
                    <a href={`https://${user.website}`} className="text-blue-600 hover:underline">
                      {user.website}
                    </a>
                  </div>
                )}
                {user.joinDate && (
                  <div className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
                    <Calendar className="w-3 h-3" />
                    <span>Rejoint en {user.joinDate}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Tabs for Posts, Replies, Media, Likes */}
        <Tabs defaultValue="posts" className="pb-8">
          <TabsList className="w-full bg-white rounded-2xl shadow border border-blue-100 flex gap-2">
            {[
              {
          value: "posts",
          icon: <StickyNote className="w-4 h-4" />,
          label: "Posts",
              },
              {
          value: "replies",
          icon: <MessageCircle className="w-4 h-4" />,
          label: "Réponses",
              },
              {
          value: "media",
          icon: <ImageIcon className="w-4 h-4" />,
          label: "Médias",
              },
              {
          value: "likes",
          icon: <Heart className="w-4 h-4" />,
          label: "J'aime",
              },
            ].map(({ value, icon, label }) => (
              <TabsTrigger
          key={value}
          value={value}
          className={[
            "flex-1 py-3 rounded-xl font-semibold transition-all duration-200 animate-fade-in",
            "hover:bg-blue-50",
            "data-[state=active]:bg-gradient-to-r",
            "data-[state=active]:from-[var(--primary)]",
            "data-[state=active]:to-[var(--primary-light)]",
            "data-[state=active]:text-white",
            "data-[state=inactive]:text-gray-500",
            "data-[state=inactive]:bg-transparent"
          ].join(" ")}
              >
          {icon}
          {label}
              </TabsTrigger>
            ))}
          </TabsList>
          {/* Posts Tab Content */}
          <TabsContent value="posts" className="mt-6 space-y-4">
            {[...posts]
              .sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0))
              .map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  user={user}
                  showPinnedPost
                  onTogglePin={handleTogglePin}
                />
              ))}
          </TabsContent>

          {/* Replies Tab Content */}
          <TabsContent value="replies" className="mt-6">
          <div className="flex flex-col items-center justify-center bg-card rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8 text-primary" />
            </div>
            <p className="text-gray-500 text-lg">Aucune réponse pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">Les réponses apparaîtront ici</p>
          </div>
          </TabsContent>

          {/* Media Tab Content */}
          <TabsContent value="media" className="mt-6">
          <div className="flex flex-col items-center justify-center bg-card rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            <p className="text-gray-500 text-lg">Aucun média partagé</p>
            <p className="text-gray-400 text-sm mt-2">Photos et vidéos apparaîtront ici</p>
          </div>
          </TabsContent>
          
          {/* Likes Tab Content */}
          <TabsContent value="likes" className="mt-6">
          <div className="flex flex-col items-center justify-center bg-card rounded-2xl shadow-lg p-12 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
            <Heart className="w-8 h-8 text-primary" />
            </div>
            <p className="text-gray-500 text-lg">Aucun like pour le moment</p>
            <p className="text-gray-400 text-sm mt-2">Les posts aimés apparaîtront ici</p>
          </div>
          </TabsContent>

        </Tabs>
      </div>
    </div>
    
  );
}