import { MappedOperation, OperationMapping, MappedOperationArgs } from "./MappedOperation";
import { GraphQLFieldConfig, GraphQLFieldConfigArgumentMap, GraphQLNonNull } from "graphql";
import { MemoizeGetter } from "./utils";
import { MappedAssociation } from "./MappedAssociation";
import { Dict } from "./util-types";
import { QueryOperationResolver } from "./QueryOperationResolver";

export class MappedQueryOperation<TMapping extends OperationMapping = any> extends MappedOperation<TMapping> {
    opType: "query" = "query";
    defaultResolver = QueryOperationResolver;

    @MemoizeGetter
    get defaultArgs(): GraphQLFieldConfigArgumentMap {
        return {
            where: {
                type: GraphQLNonNull(this.rootSource.defaultShallowInputType),
            },
        };
    }
}