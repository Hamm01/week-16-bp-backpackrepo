import { useEffect } from "react";
import { Blockhash, Commitment } from "@solana/web3.js";
import { useRecoilValue, useRecoilCallback } from "recoil";
import * as atoms from "../recoil/atoms";
import { useAnchorContextLoadable } from "./useWallet";

const REFRESH_INTERVAL = 10 * 1000;

export function useRecentBlockhash(): Blockhash {
  const bh = useRecoilValue(atoms.recentBlockhash);
  if (bh === null) {
    throw new Error("blockhash not found");
  }
  return bh;
}

export function useLoadRecentBlockhash() {
  const anchorLoadable = useAnchorContextLoadable();
  const commitment = useCommitment();
  const updateRecentBlockhash = useUpdateRecentBlockhash();
  useEffect(() => {
    if (anchorLoadable.state !== "hasValue") {
      return;
    }
    const interval = setInterval(async () => {
      const { blockhash } =
        await anchorLoadable.contents.provider.connection.getLatestBlockhash(
          commitment
        );
      updateRecentBlockhash(blockhash);
    }, REFRESH_INTERVAL);
    return () => {
      clearInterval(interval);
    };
  }, [commitment, anchorLoadable]);
}

export function useCommitment(): Commitment {
  return useRecoilValue(atoms.commitment);
}

const useUpdateRecentBlockhash = () =>
  useRecoilCallback(({ set }: any) => async (bh: Blockhash) => {
    set(atoms.recentBlockhash, bh);
  });
