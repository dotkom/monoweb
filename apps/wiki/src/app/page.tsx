import { Tiptap } from "../components/tiptap";

export default function Page() {
  return (
    <>
      <div className="p-20">
        <Tiptap
          access={true}
          json='
          <p>This is a basic example of implementing images. Drag to re-order.</p>
          '
        />
      </div>
    </>
  );
}
