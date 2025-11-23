"use client";

import React, { useEffect } from "react";
import { Card, AttackTarget } from "../types/game";
import { useTranslation } from "react-i18next";
import "./AttackResultPopup.css";

interface AttackResultPopupProps {
  attackCard: Card;
  target: AttackTarget;
  isBlocked: boolean;
  onClose: () => void;
}

const AttackResultPopup: React.FC<AttackResultPopupProps> = ({
  attackCard,
  target,
  isBlocked,
  onClose,
}) => {
  const { t } = useTranslation();

  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="attack-result-popup-overlay" onClick={onClose}>
      <div className="attack-result-popup-content" onClick={(e) => e.stopPropagation()}>
        <h2>{isBlocked ? t("attack.blocked") : t("attack.success")}</h2>
        <div className="result-details">
          <div className="card-display">
            <span className="card-rank">{attackCard.value}</span>
            <span className="card-suit">{attackCard.suit}</span>
          </div>
          <div className="arrow">➜</div>
          <div className="target-display">
            {target.attackType === "health" ? (
              <span>❤️ {t("game.health")}</span>
            ) : (
              <span>
                {target.cardValue} {target.suit}
              </span>
            )}
          </div>
        </div>
        {isBlocked && <p className="blocked-message">{t("attack.blockedMessage")}</p>}
      </div>
    </div>
  );
};

export default AttackResultPopup;
