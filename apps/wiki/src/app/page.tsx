import { Tiptap } from "../components/tiptap";

export default function Page() {
  return (
    <>
      <div className="p-20">
        <Tiptap
          access={true}
          json='
          <p>This is a basic example of implementing images. Drag to re-order.</p>
          <img src="https://source.unsplash.com/8xznAGy4HcY/800x400" />
          <img src="https://source.unsplash.com/K9QHL52rE2k/800x400" />
          '
        />
      </div>
    </>
  );
}
