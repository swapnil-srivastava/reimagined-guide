import { RealtimeChannel, Session } from "@supabase/supabase-js";
import { useEffect, useState } from "react";
import { supaClient } from "../supa-client";

export interface UserProfile {
  username: string;
  avatarUrl?: string;
}

export interface SupashipUserInfo {
  session: Session | null;
  profile: UserProfile | null;
}

export function useSession(): SupashipUserInfo {
  const [userInfo, setUserInfo] = useState<SupashipUserInfo>({
    profile: null,
    session: null,
  });
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  useEffect(() => {
    supaClient.auth.getSession().then(({ data: { session } }) => {
      setUserInfo({ ...userInfo, session });
      console.log("session getSession use-session.ts", session);
      supaClient.auth.onAuthStateChange((_event, session) => {
        setUserInfo({ session, profile: null });
        console.log("session getSession use-session.ts", session);
      });
    });
  }, []);

  useEffect(() => {
    if (userInfo.session?.user && !userInfo.profile) {
      listenToUserProfileChanges(userInfo.session.user.id).then(
        (newChannel) => {
          if (channel) {
            channel.unsubscribe();
          }
          setChannel(newChannel);
        }
      );
    } else if (!userInfo.session?.user) {
      channel?.unsubscribe();
      setChannel(null);
    }
  }, [userInfo.session]);

  async function listenToUserProfileChanges(userId: string) {
    const { data } = await supaClient
      .from("profiles")
      .select("*")
      .filter("id", "eq", userId);
    if (data?.[0]) {
      setUserInfo({ ...userInfo, profile: data?.[0] });
    }
    return supaClient
      .channel(`public:profiles`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload) => {
          setUserInfo({ ...userInfo, profile: payload.new as UserProfile });
        }
      )
      .subscribe();
  }

  return userInfo;
}
