export const SCORM_API_SCRIPT = `
var scorm = {
    apiHandle: null,
    
    getAPIHandle: function() {
        if (this.apiHandle == null) {
            this.apiHandle = this.findAPI(window);
        }
        return this.apiHandle;
    },
    
    findAPI: function(win) {
        var findAPITries = 0;
        while ((win.API == null) && (win.parent != null) && (win.parent != win)) {
            findAPITries++;
            if (findAPITries > 7) {
                return null;
            }
            win = win.parent;
        }
        return win.API;
    },
    
    init: function() {
        var api = this.getAPIHandle();
        if (api == null) return false;
        var r = api.LMSInitialize("");
        if (r.toString() != "true") return false;
        
        // Mark incomplete initially if not set
        var status = api.LMSGetValue("cmi.core.lesson_status");
        if (status == "not attempted" || status == "unknown" || status == "") {
            api.LMSSetValue("cmi.core.lesson_status", "incomplete");
        }
        return true;
    },
    
    finish: function() {
        var api = this.getAPIHandle();
        if (api == null) return false;
        api.LMSSetValue("cmi.core.lesson_status", "passed");
        api.LMSCommit("");
        api.LMSFinish("");
        return true;
    },
    
    setProgress: function(slideIndex) {
        var api = this.getAPIHandle();
        if (api == null) return false;
        api.LMSSetValue("cmi.core.lesson_location", slideIndex.toString());
        api.LMSCommit("");
        return true;
    }
};

// Auto-init on load
window.addEventListener('load', function() {
    scorm.init();
});

// Auto-finish on unload (if this was basic tracking)
// But Reveal.js will fire 'slidechanged' and we can hook into the last slide to mark finish.
`;

export function generateScormManifest(courseId: string, title: string): string {
    return `<?xml version="1.0" standalone="no" ?>
<manifest identifier="${courseId}" version="1" xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2" xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
    <metadata>
        <schema>ADL SCORM</schema>
        <schemaversion>1.2</schemaversion>
    </metadata>
    <organizations default="tf_org">
        <organization identifier="tf_org">
            <title>${title}</title>
            <item identifier="item_1" identifierref="resource_1">
                <title>${title}</title>
            </item>
        </organization>
    </organizations>
    <resources>
        <resource identifier="resource_1" type="webcontent" adlcp:scormtype="sco" href="index.html">
            <file href="index.html"/>
            <file href="scorm.js"/>
        </resource>
    </resources>
</manifest>`;
}
