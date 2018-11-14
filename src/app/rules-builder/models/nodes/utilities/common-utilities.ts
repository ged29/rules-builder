class CommonUtilities {
    regexToExtractFieldName = /^(?:HasValue|N|D|T|R)\((.+)\)$/;

    /**
     * Extracts the field name from the cast to exact type expression
     * @param packedFieldName expression from which the field name should be extracted
     */
    extractFieldName(packedFieldName: string): string {
        var result = this.regexToExtractFieldName.exec(packedFieldName);
        return result ? result[1] : packedFieldName;
    }
}

export default new CommonUtilities();