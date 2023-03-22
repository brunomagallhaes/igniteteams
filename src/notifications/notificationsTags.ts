import Onesignal from 'react-native-onesignal';

export function tagUserInfoCreate() {
    Onesignal.sendTags({
        'user_name': 'Bruno',
        'user_email': 'bruno.magalhaes@rocketseat.team'
    });
}

export function tagCartUpdate(exerciseCount: string) {
    Onesignal.sendTag('exercise_count', exerciseCount);
}