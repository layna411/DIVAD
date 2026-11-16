import { ActivityType, SensorEventType, SensorEvent } from '../../types';

export interface ValidationResult {
  isValid: boolean;
  isAdvanceStep: boolean;
  isActivityComplete: boolean;
  feedbackType: 'success' | 'warning' | 'info' | 'ignored';
  messageEn: string;
  messageTa: string;
}

export class SensorValidationEngine {
  /**
   * Validate whether an incoming sensor event is appropriate for the current activity and step
   */
  static validate(
    activityId: ActivityType,
    currentStepNumber: number,
    totalSteps: number,
    event: SensorEvent
  ): ValidationResult {
    const eventType = event.event;

    // Zipper Activity Validation
    if (activityId === 'zipper') {
      if (eventType === 'ZIPPER_CLOSED') {
        if (currentStepNumber >= 4) {
          const isComplete = currentStepNumber >= totalSteps - 1;
          return {
            isValid: true,
            isAdvanceStep: true,
            isActivityComplete: isComplete,
            feedbackType: 'success',
            messageEn: 'Super! The zipper is smoothly closed!',
            messageTa: 'அற்புதம்! ஜிப் வெற்றிகரமாக மூடப்பட்டது!',
          };
        } else {
          return {
            isValid: false,
            isAdvanceStep: false,
            isActivityComplete: false,
            feedbackType: 'warning',
            messageEn: 'Hold the base and insert the pin before pulling the zipper up.',
            messageTa: 'ஜிப்பை மேலே இழுப்பதற்கு முன் ஊசியை கீழே சரியாக செருகவும்.',
          };
        }
      } else if (eventType === 'ZIPPER_OPENED') {
        return {
          isValid: true,
          isAdvanceStep: false,
          isActivityComplete: false,
          feedbackType: 'info',
          messageEn: 'Zipper reset to bottom. Ready to zip up!',
          messageTa: 'ஜிப் கீழே கொண்டுவரப்பட்டது. இப்போது மேலே இழுக்கலாம்!',
        };
      }
    }

    // Button Activity Validation
    if (activityId === 'button') {
      if (eventType === 'BUTTON_FASTENED') {
        if (currentStepNumber >= 2) {
          const isComplete = currentStepNumber >= totalSteps;
          return {
            isValid: true,
            isAdvanceStep: true,
            isActivityComplete: isComplete,
            feedbackType: 'success',
            messageEn: 'Great job! Button is securely in the hole!',
            messageTa: 'அருமை! பொத்தான் துளைக்குள் சரியாக மாட்டப்பட்டது!',
          };
        } else {
          return {
            isValid: false,
            isAdvanceStep: false,
            isActivityComplete: false,
            feedbackType: 'info',
            messageEn: 'Carefully open the hole with your fingers first.',
            messageTa: 'முதலில் துளையை விரல்களால் விரித்துக் கொள்ளுங்கள்.',
          };
        }
      } else if (eventType === 'BUTTON_UNFASTENED') {
        return {
          isValid: true,
          isAdvanceStep: false,
          isActivityComplete: false,
          feedbackType: 'info',
          messageEn: 'Button opened. Try buttoning again!',
          messageTa: 'பொத்தான் திறக்கப்பட்டது. மீண்டும் முயற்சி செய்யவும்!',
        };
      }
    }

    // Buckle Activity Validation
    if (activityId === 'buckle') {
      if (eventType === 'BUCKLE_LOCKED') {
        if (currentStepNumber >= 2) {
          const isComplete = currentStepNumber >= totalSteps - 1;
          return {
            isValid: true,
            isAdvanceStep: true,
            isActivityComplete: isComplete,
            feedbackType: 'success',
            messageEn: 'Click! Buckle is securely locked!',
            messageTa: 'கிளிக்! பக்கிள் உறுதியாகப் பூட்டப்பட்டது!',
          };
        } else {
          return {
            isValid: false,
            isAdvanceStep: false,
            isActivityComplete: false,
            feedbackType: 'warning',
            messageEn: 'Align both sides straight before clicking together.',
            messageTa: 'பூட்டுவதற்கு முன் இரு முனைகளையும் நேராக வைக்கவும்.',
          };
        }
      } else if (eventType === 'BUCKLE_UNLOCKED') {
        return {
          isValid: true,
          isAdvanceStep: false,
          isActivityComplete: false,
          feedbackType: 'info',
          messageEn: 'Buckle released. Line it up to try again.',
          messageTa: 'பக்கிள் திறக்கப்பட்டது. மீண்டும் நேராக வையுங்கள்.',
        };
      }
    }

    // Snap Activity Validation
    if (activityId === 'snap') {
      if (eventType === 'SNAP_CONNECTED') {
        if (currentStepNumber >= 2) {
          const isComplete = currentStepNumber >= totalSteps;
          return {
            isValid: true,
            isAdvanceStep: true,
            isActivityComplete: isComplete,
            feedbackType: 'success',
            messageEn: 'Pop! Snap is firmly clicked!',
            messageTa: 'பாப்! ஸ்நாப் சரியாக அழுத்தப்பட்டது!',
          };
        } else {
          return {
            isValid: false,
            isAdvanceStep: false,
            isActivityComplete: false,
            feedbackType: 'info',
            messageEn: 'Position the stud directly above the socket before pressing.',
            messageTa: 'அழுத்துவதற்கு முன் மேட்டை குழிக்கு நேராக வைக்கவும்.',
          };
        }
      }
    }

    // Velcro Activity Validation
    if (activityId === 'velcro') {
      if (eventType === 'VELCRO_ATTACHED') {
        const isComplete = currentStepNumber >= totalSteps;
        return {
          isValid: true,
          isAdvanceStep: true,
          isActivityComplete: isComplete,
          feedbackType: 'success',
          messageEn: 'Wonderful! Velcro is pressed flat and secure!',
          messageTa: 'அற்புதம்! வெல்க்ரோ உறுதியாக ஒட்டப்பட்டது!',
        };
      }
    }

    // Red Section / Custom Fastener Validation
    if (activityId === 'red_fastener') {
      if (eventType === 'RED_FASTENER_COMPLETED') {
        return {
          isValid: true,
          isAdvanceStep: true,
          isActivityComplete: true,
          feedbackType: 'success',
          messageEn: 'Fantastic! Red practice section completed!',
          messageTa: 'அருமை! சிவப்பு பயிற்சி பிரிவு நிறைவடைந்தது!',
        };
      }
    }

    // Generic unhandled sensor event
    return {
      isValid: false,
      isAdvanceStep: false,
      isActivityComplete: false,
      feedbackType: 'ignored',
      messageEn: `Sensor signal received (${eventType}).`,
      messageTa: `சென்சார் சிக்னல் பெறப்பட்டது (${eventType}).`,
    };
  }
}

