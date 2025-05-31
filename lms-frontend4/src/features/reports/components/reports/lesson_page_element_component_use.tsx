import type { ReportDocument, ReportJSONContent } from "../../data/schema";

export const lessonPageElementComponentUse = (props: {
  recordObj: ReportDocument;
  loadedData: ReportJSONContent;
}) => {
  return (
    <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-3 rounded-md">
      {JSON.stringify(props.loadedData.data, null, 2)}
    </pre>
  );
};
