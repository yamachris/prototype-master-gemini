"use client";

import React from "react";
import { useGameStore } from "../store/GameStore";
import { useTranslation } from "react-i18next";
import "./SacrificeButton.css";

export function SacrificeButton() {
  const { selectedCards, phase, hasPlayedAction, setSacrificeMode } =
    useGameStore();
  const { t } = useTranslation();

  const specialCard = selectedCards[0];
  const isSpecialCard =
    specialCard?.value === "K" ||
    specialCard?.value === "Q" ||
    specialCard?.value === "J";
  const canSacrifice = phase === "PLAY" && !hasPlayedAction && isSpecialCard;

  const handleClick = () => {
    if (!canSacrifice) return;
    setSacrificeMode(true);
  };

  if (!isSpecialCard) return null;

  return (
    <button
      onClick={handleClick}
      disabled={!canSacrifice}
      className="sacrifice-button"
      title={t("game.sacrifice.title")}
    >
      Sacrifier
    </button>
  );
}
