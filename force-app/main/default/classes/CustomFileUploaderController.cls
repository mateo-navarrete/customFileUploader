/**
 * @description       : Allows for deletion of the content documents uploaded by the user via the customFileUploader lwc
 * @author            : mateo navarrete
 * @group             : BizOps
 * @last modified on  : 12-15-2020
 * @last modified by  : mateo navarrete
 * Modifications Log
 * Ver   Date         Author            Modification
 * 1.0   12-15-2020   mateo navarrete   Initial Version
 **/
public with sharing class CustomFileUploaderController {
  @AuraEnabled
  public static Map<String, Boolean> deleteDocuments(List<String> cdIDs) {
    Map<String, Boolean> result = new Map<String, Boolean>();
    result.put('success', false);
    try {
      ContentDocument[] cd = new List<ContentDocument>();
      cd = [SELECT Id FROM ContentDocument WHERE Id = :cdIDs];
      delete cd;
      result.put('success', true);
      //   delete [SELECT Id FROM ContentDocument WHERE Id = :cdIDs];
      //   return 'SUCCESS';
    } catch (Exception e) {
      result.put('success', false);
      throw new AuraHandledException(
        '\nExceptionMessage: ' +
        e.getMessage() +
        '\nExceptionCause: ' +
        e.getCause()
      );
    }
    return result;
  }
}
