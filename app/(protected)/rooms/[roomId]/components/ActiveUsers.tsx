import type { Collaborator } from "@/hooks/useYjsStore";

const ActiveUsers = ({ users }: { users: Collaborator[] }) => {
  return (
    <div className="flex items-center -space-x-2">
      {users.map((collaborator) => (
        <div
          key={collaborator.clientId}
          className="size-7 rounded-full flex items-center justify-center text-white text-sm font-bold border-2 border-white relative hover:z-10 transition-transform hover:scale-110 shadow-sm"
          style={{ backgroundColor: collaborator.color }}
          title={
            collaborator.isSelf
              ? `${collaborator.name} (You)`
              : collaborator.name
          }
        >
          {collaborator.name.charAt(0).toUpperCase()}
        </div>
      ))}
    </div>
  );
};

export default ActiveUsers;
