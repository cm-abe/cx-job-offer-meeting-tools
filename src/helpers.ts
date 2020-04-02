function hasProperty<K extends string>(x: unknown, name: K): x is { [M in K]: unknown } {
    return x instanceof Object && name in x;
}

function getMentionsUser(text: string): RegExpMatchArray {
    const regIdPattern = /<@[A-Z0-9]{9}>/g;

    return text.match(regIdPattern);
}

function checkJobOfferInformation(formData: FormStates): boolean {
    const regInvalidChannelNamePattern = /[ 　,\.、。]/g;

    return regInvalidChannelNamePattern.test(formData.values.applicant_name_kana.entered_applicant_name_kana.value);
}

function generateJobOfferChannel(formData: FormStates):string {
    return `rec-cx-${formData.values.job_type.selected_job_type.selected_option.text.text}-${formData.values.applicant_name_kana.entered_applicant_name_kana.value}様`;
}

export {hasProperty, getMentionsUser, checkJobOfferInformation, generateJobOfferChannel};