import { createContext, ReactNode, useState, useEffect } from "react";

import {storageUserGet, storageUserRemove, storageUserSave} from "@storage/storageUser";
import {storageAuthTokenSave, storageAuthTokenGet, storageAuthTokenRemove } from "@storage/storageAuthToken";

import { api } from "@services/api";
import { UserDTO } from "@dtos/UserDTO";

import {tagCartUpdate} from '../notifications/notificationsTags';

export type AuthContextDataProps = {
  user: UserDTO;
  singIn: (email: string, password: string) => void;
  isLoadingUserStorageData: boolean;
  signOut: () => Promise<void>;
  updateUserProfile: (userUpdated: UserDTO) => Promise<void>;
  refreshedToken: string;
};

type AuthContextProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext<AuthContextDataProps>(
  {} as AuthContextDataProps
);

export const AuthContextProvider = ({ children }: AuthContextProviderProps) => {
  const [user, setUser] = useState<UserDTO>({} as UserDTO);
  const [refreshedToken, setRefreshedToken] = useState("");
  const [isLoadingUserStorageData, setIsLoadingUserStorageData] =
    useState(true);

  const updateUserProfile = async (userUpdated: UserDTO) => {
    try {
      setUser(userUpdated);
      tagCartUpdate(userUpdated.name.toString());
      await storageUserSave(userUpdated);
    } catch (error) {
      throw error;
    }
  };

  const loadUserData = async () => {
    try {
      setIsLoadingUserStorageData(true);

      const userLogged = await storageUserGet();
      const token = await storageAuthTokenGet();

      if (token && userLogged) {
        userAndTokenUpdate(userLogged, token);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  };

  const storageUserAndTokenSave = async (userData: UserDTO, token: string) => {
    try {
      setIsLoadingUserStorageData(true);

      await storageUserSave(userData);
      await storageAuthTokenSave(token);
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  };

  const userAndTokenUpdate = (userData: UserDTO, token: string) => {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    setUser(userData);
  };

  const singIn = async (email: string, password: string) => {
    try {
      const { data } = await api.post("/sessions", { email, password });

      if (data.user && data.token) {
        await storageUserAndTokenSave(data.user, data.token);
        userAndTokenUpdate(data.user, data.token);
      }
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  };

  const signOut = async () => {
    try {
      setIsLoadingUserStorageData(true);
      setUser({} as UserDTO);
      await storageUserRemove();
      await storageAuthTokenRemove();
    } catch (error) {
      throw error;
    } finally {
      setIsLoadingUserStorageData(false);
    }
  };

  const refreshTokenUpdated = (newToken: string) => {
    setRefreshedToken(newToken);
  };

  useEffect(() => {
    const subscribe = api.registerInterceptTokenManager({
      signOut,
      refreshTokenUpdated,
    });

    return () => {
      subscribe();
    };
  }, []);

  useEffect(() => {
    loadUserData();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        singIn,
        isLoadingUserStorageData,
        signOut,
        updateUserProfile,
        refreshedToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
