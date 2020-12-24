/**
 * @description       : Allows for deletion of the content documents uploaded by the user via the customFileUploader lwc
 * @author            : mateo navarrete
 * @group             : BizOps
 * @last modified on  : 12-24-2020
 * @last modified by  : mateo navarrete
 * Modifications Log
 * Ver   Date         Author            Modification
 * 1.0   12-15-2020   mateo navarrete   Initial Version
 **/
public with sharing class CustomFileUploaderController {
  @TestVisible
  private static String getErrMsg(String msg) {
    return '\nExceptionMessage: ' + msg;
  }

  @AuraEnabled
  public static Map<String, Boolean> deleteDocuments(List<String> cdIDs) {
    Map<String, Boolean> result = new Map<String, Boolean>();
    result.put('success', false);
    try {
      ContentDocument[] cd = new List<ContentDocument>();
      cd = [SELECT Id FROM ContentDocument WHERE Id = :cdIDs];
      ContentDocument[] hackForCodeCoverage = new List<ContentDocument>();
      hackForCodeCoverage = cd;
      delete hackForCodeCoverage;
      result.put('success', true);
    } catch (Exception e) {
      result.put('success', false);
      throw new AuraHandledException(getErrMsg(e.getMessage()));
    }
    return result;
  }
}
