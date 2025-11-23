"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { useGameStore } from "../store/GameStore";
import "./AttackPopup.css";
import { Card, AttackTarget } from "../types/game";
import { useTranslation } from "react-i18next";
import { AudioManager } from "../sound-design/audioManager";

// Attack types
type AttackType = "unit" | "health";

interface AttackPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    attackType: AttackType,
    target?: AttackTarget,
    card?: Card,
  ) => void;
  attackerCard: Card | null;
  opponentCards: Card[];
  opponentHealth: number;
}

const AttackPopup: React.FC<AttackPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  attackerCard,
  opponentCards,
  opponentHealth,
}) => {
  const {
    currentAttackCard,
    turnTimeRemaining,
  } = useGameStore();

  const isJokerCard = currentAttackCard?.value === "JOKER";
  const isLowValueUnitCard =
    currentAttackCard &&
    ["A", "2", "3", "4", "5", "6", "7"].includes(currentAttackCard.value);

  // Determine default attack type
  const getDefaultAttackType = (): AttackType => {
    if (isJokerCard) return "unit"; // Joker defaults to unit attack
    if (isLowValueUnitCard) return "health"; // Low value unit cards default to health attack
    return "unit"; // Default to unit attack otherwise
  };
  const [selectedAttackType, setSelectedAttackType] = useState<AttackType>(
    getDefaultAttackType(),
  );

  // Calculate damage points based on the card value
  const calculateDamagePoints = () => {
    if (!currentAttackCard) return 1; // Default damage

    // Map card values to damage points
    const damageMap: { [key: string]: number } = {
      A: 1,
      "2": 2,
      "3": 3,
      "4": 4,
      "5": 5,
      "6": 6,
      "7": 7,
      "8": 8,
      "9": 9,
      "10": 10,
      J: 10,
      Q: 10,
      K: 10,
      JOKER: 0,
    };

    return damageMap[currentAttackCard.value] || 1;
  };

  const damagePoints = calculateDamagePoints();
  const [selectedTarget, setSelectedTarget] = useState<AttackTarget | null>(
    null,
  );
  const [availableTargets, setAvailableTargets] = useState<AttackTarget[]>([]);
  const [timeRemaining, setTimeRemaining] = useState(turnTimeRemaining);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const { t } = useTranslation();

  // Close the popup
  const handleClose = useCallback(() => {
    // Play sound effect
    AudioManager.getInstance().playCardSound();
    onClose();
  }, [onClose]);

  // Handle attack confirmation
  const handleConfirm = () => {
    // Validate selection
    if (selectedAttackType === "unit" && !selectedTarget) {
      return;
    }

    // Play sound effect
    AudioManager.getInstance().playCardSound();

    // Confirm attack
    if (selectedAttackType === "health") {
      onConfirm("health");
    } else {
      onConfirm("unit", selectedTarget || undefined, currentAttackCard || undefined);
    }
  };

  // Update available targets when attack type changes
  useEffect(() => {
    if (selectedAttackType === "unit") {
      // Filter opponent cards that can be attacked
      // For now, we assume all opponent cards can be attacked unless there are specific rules
      // In a real game, we might filter based on card effects, etc.
      const targets: AttackTarget[] = opponentCards.map((card) => ({
        type: "card",
        card,
      }));
      setAvailableTargets(targets);

      // Auto-select first target if none selected
      if (targets.length > 0 && !selectedTarget) {
        setSelectedTarget(targets[0]);
      }
    } else {
      setAvailableTargets([]);
      setSelectedTarget(null);
    }
  }, [selectedAttackType, opponentCards, selectedTarget]);

  // Sync with global timer
  useEffect(() => {
    setTimeRemaining(turnTimeRemaining);
  }, [turnTimeRemaining]);

  // Local timer countdown
  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
      return;
    }

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev: number) => {
        if (prev <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          handleClose();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isOpen, handleClose]);

  // Reset state when popup opens
  useEffect(() => {
    if (isOpen) {
      setSelectedAttackType(getDefaultAttackType());
      // Reset target selection logic will run in the other useEffect
    }
  }, [isOpen, currentAttackCard]);

  if (!isOpen) return null;

  return (
    <div className="attack-popup-overlay">
      <div className="attack-popup-content">
        <div className="attack-popup-header">
          <h2>{t("attack.chooseAttack")}</h2>
          <div className="timer-display">
            {t("game.timeRemaining")}: {timeRemaining}s
          </div>
        </div>

        <div className="attack-options">
          <div
            className={`attack-option ${selectedAttackType === "health" ? "selected" : ""
              }`}
            onClick={() => setSelectedAttackType("health")}
          >
            <div className="option-icon">❤️</div>
            <div className="option-details">
              <h3>{t("attack.attackHealth")}</h3>
              <p>{t("game.damagePoints")}: {damagePoints}</p>
            </div>
          </div>

          <div
            className={`attack-option ${selectedAttackType === "unit" ? "selected" : ""
              }`}
            onClick={() => setSelectedAttackType("unit")}
          >
            <div className="option-icon">⚔️</div>
            <div className="option-details">
              <h3>{t("attack.attackUnit")}</h3>
              <p>{t("attack.selectTarget")}</p>
            </div>
          </div>
        </div>

        {selectedAttackType === "unit" && (
          <div className="target-selection">
            <h3>{t("attack.selectTarget")}</h3>
            <div className="targets-list">
              {availableTargets.length === 0 ? (
                <p>{t("attack.noValidTargets")}</p>
              ) : (
                availableTargets.map((target: AttackTarget, index: number) => (
                  <div
                    key={index}
                    className={`target-item ${selectedTarget === target ? "selected" : ""
                      }`}
                    onClick={() => setSelectedTarget(target)}
                  >
                    <div className="card-preview">
                      {target.card?.value} {target.card?.suit}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        <div className="attack-popup-footer">
          <button className="cancel-button" onClick={handleClose}>
            {t("game.ui.cancel")}
          </button>
          <button
            className="confirm-button"
            onClick={handleConfirm}
            disabled={selectedAttackType === "unit" && !selectedTarget}
          >
            {t("game.ui.confirm")}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AttackPopup;
