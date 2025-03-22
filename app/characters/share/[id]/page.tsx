import CharacterShareClient from "./client";

type tParams = Promise<{ id: string }>;

export default async function CharacterSharePage(props: { params: tParams }) {
    const params = await props.params;

    return <CharacterShareClient id={params.id} />;
}
