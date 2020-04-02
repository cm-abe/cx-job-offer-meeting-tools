type TextInput = {
    type: string,
    value: string
};

type UserSelection = {
    type: string,
    selected_users: string[]
};

type PullDownText = {
    type: string,
    text: string,
    emoji: boolean
}

type PullDownSelection = {
    type: string,
    selected_option: {
        text: PullDownText,
        value: string
    }
};

type FormStates = {
    values: {
        applicant_name: {
            entered_applicant_name: TextInput
        },
        applicant_name_kana: {
            entered_applicant_name_kana: TextInput
        },
        offer_team_managers: {
            selected_offer_team_manager: UserSelection
        },
        job_type: {
            selected_job_type: PullDownSelection
        }
    }
};