import Entity from "../../js/entities/character/Entity";

const PostConstructMethods = new Map<string, Function[]>();

export default function PostConstruct(target: any, method: Function) {
    if(!PostConstructMethods.has(target.name)) {
        PostConstructMethods.set(target.name, []);
    }
   const methods = PostConstructMethods.get(target.name);
   if(!methods.includes(method)) {
        PostConstructMethods.get(target.name).push(method);
   }
}

export function RunPostConstructMethods(entity: Entity, classNames: string[]) {    
    const methods: Function[] = [];
    if(classNames && classNames.length) {
        for(const className of classNames) {
            const classMethods = PostConstructMethods.get(className) || [];
            methods.push(...classMethods);
        }
    }

    for (const method of methods) {
        // bind to proper entity?
        // (entity as any)[methodName]();
        method.call(entity);
    }
}
