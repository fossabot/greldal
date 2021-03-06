import { MappedOperation, OperationMapping, MappedOperationArgs } from "./MappedOperation";
import { GraphQLFieldConfig, GraphQLFieldConfigArgumentMap, GraphQLList, GraphQLNonNull } from "graphql";
import { MemoizeGetter } from "./utils";
import { DeletionOperationResolver } from "./DeletionOperationResolver";
import { MappedMutationOperation } from "./MappedMutationOperation";

export class MappedDeletionOperation<TMapping extends OperationMapping = any> extends MappedMutationOperation<
    TMapping
> {
    defaultResolver = DeletionOperationResolver;
    @MemoizeGetter
    get defaultArgs(): GraphQLFieldConfigArgumentMap {
        return {
            where: {
                type: GraphQLNonNull(this.rootSource.defaultShallowInputType),
            },
        };
    }
}
