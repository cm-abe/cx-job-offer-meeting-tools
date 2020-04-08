export class JobOfferMeeting {
    readonly formData: FormStates;

    constructor(formData: FormStates) {
        this.formData = formData;
    }

    public getManagers(): string[] {
        return this.formData.values.offer_team_managers.selected_offer_team_manager.selected_users;
    }

    public getESPic(): string[] {
        return this.formData.values.es_div_pic.selected_es_div_pic.selected_users;
    }

    public getJobType(): string {
        return this.formData.values.job_type.selected_job_type.selected_option.value;
    }

    public getApplicantNameKana(): string {
        return this.formData.values.applicant_name_kana.entered_applicant_name_kana.value;
    }

    public getJobOfferChannelName(): string {
        return `rec-cx-${this.getJobType()}-${this.getApplicantNameKana()}様`;
    }

    public getChannelUsers(): string[] {
        return this.getManagers().concat(this.getESPic());
    }

    public validateForm(): any {
        const regInvalidChannelNamePattern = /[ 　,\.、。]/g;

        if(regInvalidChannelNamePattern.test(this.getApplicantNameKana())) {
            return {
                "response_action": "errors",
                "errors": {
                  "applicant_name_kana": "半角/全角を含む空白や句読点は入力しないでください"
                }
              }
        }
    }
}