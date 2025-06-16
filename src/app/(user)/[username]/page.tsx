"use client";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  UserPlaceholderIcon,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Stats } from "@/components/custom/stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  ArrowLeft,
  Calendar,
  Flag,
  Heart,
  ImageIcon,
  LinkIcon,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Pencil,
  Send,
  Sparkles,
  StickyNote,
  UserRoundCheck,
  UserRoundPlus,
} from "lucide-react";
import { notFound, useParams } from "next/navigation";
import Link from "next/link";
import { Post, PostType } from "@/components/custom/post";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import apiClient from "@/utils/api";
import { User } from "@/services/userService";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

// Sample posts data
const samplePosts = [
  {
    id: 1,
    content:
      "Excited to announce that I'll be speaking at the upcoming React Conference! Can't wait to share my insights on modern web development 🚀",
    timestamp: "2h",
    likes: 89,
    comments: 23,
    reposts: 12,
    tags: ["ReactConf", "WebDev"],
    pinned: true,
    media: {
      type: "image" as const,
      url: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?auto=compress&w=800&q=80", // conference / tech talk
    },
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
  {
    id: 4,
    content:
      "Découvrez ma dernière vidéo sur l'intégration de l'IA dans les applications web !",
    timestamp: "3d",
    likes: 67,
    comments: 15,
    reposts: 7,
    tags: ["Video", "AI"],
    media: {
      type: "video" as const,
      url: "https://videos.pexels.com/video-files/857195/857195-sd_640_360_25fps.mp4",
    },
  },
] as PostType[];

export default function ProfilePage() {
  const params = useParams();

  const [userData, setUserData] = useState<User>();
  const [loading, setLoading] = useState(true);
  const [posts, setPosts] = useState<PostType[]>(samplePosts);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState<number>(0);
  const [likedPosts, setLikedPosts] = useState<number[]>([]);

  const form = useForm({
    defaultValues: {
      displayName: userData?.displayName,
      bio: userData?.bio || "",
      website: "userData?.website",
    },
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get(`/users/${params.username}`);
        setUserData(res.data);
        setFollowersCount(res.data.followersCount || 0);
      } catch (err) {
        setUserData(undefined);
        setFollowersCount(0);
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [params.username]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <span>Chargement...</span>
      </div>
    );
  }

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = form;

  const user = userData;
  // Si l'utilisateur n'est pas trouvé, on peut rediriger ou afficher un message
  if (!user) {
    notFound();
  }

  const handleFollowClick = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowersCount((count) => count - 1);
    } else {
      setIsFollowing(true);
      setFollowersCount((count) => count + 1);
    }
  };

  const handleTogglePin = (postId: number) => {
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, pinned: !p.pinned } : p))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Floating Header */}
      <div className="bg-white/60 backdrop-blur-md sticky top-0 z-11 shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4 h-16">
            <Link
              href="/"
              className="flex items-center gap-2 text-[var(--primary)] hover:text-[var(--primary-light)] transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-gray-900">
                {user.displayName}
              </h1>
              <Sparkles className="w-4 h-4 text-[var(--primary-light)]" />
            </div>
          </div>
        </div>
      </div>

      {/* Banner */}
      <div className="relative h-64 overflow-hidden ">
        <img
          src={user.coverPicture || "/placeholder.svg"}
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
                  <AvatarImage
                    src={user.profilePicture || "/placeholder.svg"}
                    alt={user.displayName}
                  />
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
                <Stats label="Posts" value={user.postsCount} />
                <Stats label="Followers" value={followersCount} />
                <Stats label="Following" value={user.followingCount} />
              </div>
            </div>

            {/* Info Section */}
            <div className="flex-1">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-1">
                    {user.displayName}
                  </h2>
                  <p className="text-[var(--primary-light)] font-medium">
                    @{user.username}
                  </p>
                </div>

                <div className="flex gap-2 items-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="rounded-full border-gray-300 hover:border-blue-300"
                      >
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
                  {/* Dialog “Modifier le profil” */}
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button
                        variant="default"
                        size="sm"
                        className="rounded-full flex items-center gap-2"
                      >
                        <Pencil className="w-4 h-4" />
                        Modifier le profil
                      </Button>
                    </DialogTrigger>

                    <DialogContent className="max-w-md bg-white rounded-2xl shadow-lg p-6">
                      <DialogHeader>
                        <DialogTitle>Modifier le profil</DialogTitle>
                        <DialogDescription>
                          Modifie les informations de ton profil ci-dessous.
                        </DialogDescription>
                      </DialogHeader>

                      <form
                        onSubmit={handleSubmit(async (data) => {
                          console.log(
                            "TODO: appeler l’API de mise à jour",
                            data
                          );
                        })}
                        className="space-y-6"
                      >
                        <div className="flex justify-center">
                          <Avatar className="w-20 h-20 ring-4 ring-white shadow-md">
                            <AvatarImage
                              src={user.profilePicture || "/placeholder.svg"}
                              alt={user.displayName}
                            />
                            <AvatarFallback className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary-light)] text-white">
                              <UserPlaceholderIcon className="w-10 h-10" />
                            </AvatarFallback>
                          </Avatar>
                        </div>

                        {/* Nom affiché */}
                        <div className="space-y-1">
                          <label
                            htmlFor="displayName"
                            className="block text-sm font-medium"
                          >
                            Nom affiché
                          </label>
                          <Input
                            id="displayName"
                            {...register("displayName", {
                              required: "Le nom est requis",
                            })}
                          />
                          {errors.displayName && (
                            <p className="text-xs text-red-600">
                              {errors.displayName.message}
                            </p>
                          )}
                        </div>

                        {/* Bio */}
                        <div className="space-y-1">
                          <label
                            htmlFor="bio"
                            className="block text-sm font-medium"
                          >
                            Bio
                          </label>
                          <Textarea id="bio" rows={3} {...register("bio")} />
                        </div>

                        {/* Site web */}
                        <div className="space-y-1">
                          <label
                            htmlFor="website"
                            className="block text-sm font-medium"
                          >
                            Site web
                          </label>
                          <Input
                            id="website"
                            type="url"
                            {...register("website", {
                              pattern: {
                                value:
                                  /^(https?:\/\/)?[\w-]+(\.[\w-]+)+[/#?]?.*$/i,
                                message: "URL invalide",
                              },
                            })}
                          />
                          {errors.website && (
                            <p className="text-xs text-red-600">
                              {errors.website.message}
                            </p>
                          )}
                        </div>

                        <DialogFooter className="flex justify-end gap-2">
                          <DialogClose asChild>
                            <Button variant="outline">Fermer</Button>
                          </DialogClose>
                          <Button type="submit" variant="default">
                            Enregistrer
                          </Button>
                        </DialogFooter>
                      </form>
                    </DialogContent>
                  </Dialog>
                  <Button
                    className={`min-w-[120px] rounded-full px-4 py-2 transition-all duration-200 flex items-center gap-2
                      ${
                        isFollowing
                          ? "bg-white text-[var(--primary)] border border-blue-200 hover:bg-[var(--secondary-light)] hover:text-[var(--primary-light)] shadow-sm"
                          : "bg-[var(--primary)] text-white shadow-lg"
                      }
                      active:scale-95
                    `}
                    onClick={handleFollowClick}
                  >
                    {isFollowing ? (
                      <>
                        <UserRoundCheck className="w-4 h-4 transition-transform duration-200" />
                        <span>Suivi(e)</span>
                      </>
                    ) : (
                      <>
                        <UserRoundPlus className="w-4 h-4 transition-transform duration-200" />
                        <span>Suivre</span>
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Bio and Additional Info */}
              <p className="text-gray-700 leading-relaxed mt-4 mb-4">
                {user.bio}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                {/* {user.location && ( */}
                <div className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
                  <MapPin className="w-3 h-3" />
                  <span>user.location</span>
                </div>
                {/* )} */}
                {/* {user.website && ( */}
                <div className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
                  <LinkIcon className="w-3 h-3" />
                  <a
                    href={`https://user.website`}
                    className="text-blue-600 hover:underline"
                  >
                    user.website
                  </a>
                </div>
                {/* )} */}
                {user.createdAt && (
                  <div className="flex items-center gap-1 bg-gray-50 rounded-full px-3 py-1">
                    <Calendar className="w-3 h-3" />
                    <span>
                      Rejoint en{" "}
                      {new Date(user.createdAt).toLocaleDateString("fr-FR", {
                        year: "numeric",
                        month: "long",
                      })}
                    </span>
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
                  "data-[state=inactive]:bg-transparent",
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
                  user={{
                    displayName: user.displayName,
                    username: user.username,
                    avatar: user.profilePicture,
                  }}
                  showPinnedPost
                  onTogglePin={handleTogglePin}
                  liked={likedPosts.includes(post.id)}
                  onToggleLike={() => {
                    setLikedPosts((prev) =>
                      prev.includes(post.id)
                        ? prev.filter((id) => id !== post.id)
                        : [...prev, post.id]
                    );
                  }}
                />
              ))}
          </TabsContent>

          {/* Replies Tab Content */}
          <TabsContent value="replies" className="mt-6">
            <div className="flex flex-col items-center justify-center bg-card rounded-2xl shadow-lg p-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <MessageCircle className="w-8 h-8 text-primary" />
              </div>
              <p className="text-gray-500 text-lg">
                Aucune réponse pour le moment
              </p>
              <p className="text-gray-400 text-sm mt-2">
                Les réponses apparaîtront ici
              </p>
            </div>
          </TabsContent>

          {/* Media Tab Content */}
          <TabsContent value="media" className="mt-6 space-y-4">
            {[...posts]
              .filter((post) => !!post.media)
              .map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  user={{
                    displayName: user.displayName,
                    username: user.username,
                    avatar: user.profilePicture,
                  }}
                  showPinnedPost
                  onTogglePin={handleTogglePin}
                  liked={likedPosts.includes(post.id)}
                  onToggleLike={() => {
                    setLikedPosts((prev) =>
                      prev.includes(post.id)
                        ? prev.filter((id) => id !== post.id)
                        : [...prev, post.id]
                    );
                  }}
                />
              ))}
            {[...posts].filter((post) => !!post.media).length === 0 && (
              <div className="flex flex-col items-center justify-center bg-card rounded-2xl shadow-lg p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <ImageIcon className="w-8 h-8 text-primary" />
                </div>
                <p className="text-gray-500 text-lg">Aucun média partagé</p>
                <p className="text-gray-400 text-sm mt-2">
                  Photos et vidéos apparaîtront ici
                </p>
              </div>
            )}
          </TabsContent>

          {/* Likes Tab Content */}
          <TabsContent value="likes" className="mt-6 space-y-4">
            {[...posts]
              .filter((post) => likedPosts.includes(post.id))
              .map((post) => (
                <Post
                  key={post.id}
                  post={post}
                  user={{
                    displayName: user.displayName,
                    username: user.username,
                    avatar: user.profilePicture,
                  }}
                  showPinnedPost
                  onTogglePin={handleTogglePin}
                  liked={likedPosts.includes(post.id)}
                  onToggleLike={() => {
                    setLikedPosts((prev) =>
                      prev.includes(post.id)
                        ? prev.filter((id) => id !== post.id)
                        : [...prev, post.id]
                    );
                  }}
                />
              ))}
            {likedPosts.length === 0 && (
              <div className="flex flex-col items-center justify-center bg-card rounded-2xl shadow-lg p-12 text-center">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                  <Heart className="w-8 h-8 text-primary" />
                </div>
                <p className="text-gray-500 text-lg">
                  Aucun like pour le moment
                </p>
                <p className="text-gray-400 text-sm mt-2">
                  Les posts aimés apparaîtront ici
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
